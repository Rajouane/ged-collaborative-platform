<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\SpaceMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SpaceMemberController extends Controller
{
    /**
     * ============================================================
     * LISTE DES MEMBRES D'UN ESPACE
     * ============================================================
     */
    public function index(Space $space): JsonResponse
    {
        $user = request()->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier l'accès à l'espace
        |--------------------------------------------------------------------------
        */

        $isMember = SpaceMember::where('space_id', $space->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$isMember && !$this->isAdmin($user)) {
            return response()->json([
                'message' => 'Vous n’avez pas accès à cet espace.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Récupérer les membres
        |--------------------------------------------------------------------------
        */

        $members = SpaceMember::where('space_id', $space->id)
            ->with([
                'user:id,first_name,last_name,email,role_id,department,phone,is_active'
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'data' => $members
        ]);
    }


    /**
     * ============================================================
     * AJOUTER UN MEMBRE
     * ============================================================
     */
    public function store(
        Request $request,
        Space $space
    ): JsonResponse {
        $currentUser = $request->user();

        if (!$currentUser) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id'
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Vérifier les permissions
        |--------------------------------------------------------------------------
        */

        if (!$this->canManageMembers($currentUser, $space)) {
            return response()->json([
                'message' =>
                    'Vous n’avez pas l’autorisation de gérer les membres de cet espace.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Utilisateur à ajouter
        |--------------------------------------------------------------------------
        */

        $userToAdd = User::find($validated['user_id']);

        if (!$userToAdd) {
            return response()->json([
                'message' => 'Utilisateur introuvable.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier si déjà membre
        |--------------------------------------------------------------------------
        */

        $alreadyMember = SpaceMember::where('space_id', $space->id)
            ->where('user_id', $userToAdd->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json([
                'message' =>
                    'Cet utilisateur est déjà membre de cet espace.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Ajouter le membre
        |--------------------------------------------------------------------------
        */

        $member = SpaceMember::create([
            'space_id' => $space->id,
            'user_id' => $userToAdd->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Charger l'utilisateur
        |--------------------------------------------------------------------------
        */

        $member->load([
            'user:id,first_name,last_name,email,role_id,department,phone,is_active'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notification
        |--------------------------------------------------------------------------
        */

        $this->createNotification(
            $userToAdd->id,
            $space
        );

        return response()->json([
            'message' =>
                'Utilisateur ajouté à l’espace avec succès.',
            'data' => $member
        ], 201);
    }


    /**
     * ============================================================
     * MODIFIER UN MEMBRE
     * ============================================================
     */
    public function update(
        Request $request,
        Space $space,
        User $user
    ): JsonResponse {
        $currentUser = $request->user();

        if (!$currentUser) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier les permissions
        |--------------------------------------------------------------------------
        */

        if (!$this->canManageMembers($currentUser, $space)) {
            return response()->json([
                'message' =>
                    'Vous n’avez pas l’autorisation de modifier les membres.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier que l'utilisateur est membre
        |--------------------------------------------------------------------------
        */

        $member = SpaceMember::where('space_id', $space->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$member) {
            return response()->json([
                'message' =>
                    'Cet utilisateur n’est pas membre de cet espace.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Modifier le rôle si la colonne existe
        |--------------------------------------------------------------------------
        */

        if ($request->has('role')) {

            $validated = $request->validate([
                'role' => [
                    'required',
                    'string',
                    'max:50'
                ],
            ]);

            $columns = DB::getSchemaBuilder()
                ->getColumnListing('space_members');

            if (!in_array('role', $columns, true)) {
                return response()->json([
                    'message' =>
                        'La colonne role n’existe pas dans space_members.'
                ], 422);
            }

            $member->role = $validated['role'];
            $member->save();
        }

        $member->load([
            'user:id,first_name,last_name,email,role_id,department,phone,is_active'
        ]);

        return response()->json([
            'message' =>
                'Membre modifié avec succès.',
            'data' => $member
        ]);
    }


    /**
     * ============================================================
     * SUPPRIMER UN MEMBRE
     * ============================================================
     */
    public function destroy(
        Request $request,
        Space $space,
        User $user
    ): JsonResponse {
        $currentUser = $request->user();

        if (!$currentUser) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier les permissions
        |--------------------------------------------------------------------------
        */

        if (!$this->canManageMembers($currentUser, $space)) {
            return response()->json([
                'message' =>
                    'Vous n’avez pas l’autorisation de supprimer les membres.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Empêcher l'utilisateur de se supprimer lui-même
        |--------------------------------------------------------------------------
        */

        if ((int) $currentUser->id === (int) $user->id) {
            return response()->json([
                'message' =>
                    'Vous ne pouvez pas vous supprimer vous-même de cet espace.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Chercher le membre
        |--------------------------------------------------------------------------
        */

        $member = SpaceMember::where('space_id', $space->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$member) {
            return response()->json([
                'message' =>
                    'Cet utilisateur n’est pas membre de cet espace.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Suppression
        |--------------------------------------------------------------------------
        */

        $member->delete();

        return response()->json([
            'message' =>
                'Utilisateur supprimé de l’espace avec succès.'
        ]);
    }


    /**
     * ============================================================
     * VÉRIFIER ADMIN
     * ============================================================
     */
    private function isAdmin(User $user): bool
    {
        try {

            $user->loadMissing('role');

            if ($user->role) {

                $roleName = strtolower(
                    trim((string) $user->role->name)
                );

                return in_array(
                    $roleName,
                    [
                        'administrateur',
                        'admin',
                        'administrator'
                    ],
                    true
                );
            }

        } catch (\Throwable $e) {

            logger()->error(
                'Erreur vérification admin: ' .
                $e->getMessage()
            );
        }

        return false;
    }


    /**
     * ============================================================
     * VÉRIFIER PERMISSION DE GÉRER LES MEMBRES
     * ============================================================
     */
    private function canManageMembers(
        User $user,
        Space $space
    ): bool {

        /*
        |--------------------------------------------------------------------------
        | Administrateur global
        |--------------------------------------------------------------------------
        */

        if ($this->isAdmin($user)) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier si membre
        |--------------------------------------------------------------------------
        */

        $member = SpaceMember::where('space_id', $space->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$member) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Si space_members possède role
        |--------------------------------------------------------------------------
        */

        try {

            $columns = DB::getSchemaBuilder()
                ->getColumnListing('space_members');

            if (in_array('role', $columns, true)) {

                $role = strtolower(
                    trim((string) $member->role)
                );

                return in_array(
                    $role,
                    [
                        'owner',
                        'admin',
                        'administrator',
                        'manager',
                        'responsable'
                    ],
                    true
                );
            }

        } catch (\Throwable $e) {

            logger()->error(
                'Erreur vérification permission membre: ' .
                $e->getMessage()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Si aucune colonne role n'existe
        |--------------------------------------------------------------------------
        |
        | Pour le moment, un membre peut gérer les membres.
        |
        */

        return true;
    }


    /**
     * ============================================================
     * CRÉER UNE NOTIFICATION
     * ============================================================
     */
    private function createNotification(
        int $userId,
        Space $space
    ): void {

        try {

            /*
            |--------------------------------------------------------------------------
            | Récupérer les colonnes de notifications
            |--------------------------------------------------------------------------
            */

            $columns = DB::getSchemaBuilder()
                ->getColumnListing('notifications');

            $data = [];

            /*
            |--------------------------------------------------------------------------
            | user_id
            |--------------------------------------------------------------------------
            */

            if (in_array('user_id', $columns, true)) {
                $data['user_id'] = $userId;
            }

            /*
            |--------------------------------------------------------------------------
            | title
            |--------------------------------------------------------------------------
            */

            if (in_array('title', $columns, true)) {
                $data['title'] =
                    'Nouvel espace collaboratif';
            }

            /*
            |--------------------------------------------------------------------------
            | message
            |--------------------------------------------------------------------------
            */

            if (in_array('message', $columns, true)) {
                $data['message'] =
                    'Vous avez été ajouté à l’espace "' .
                    $space->name .
                    '".';
            }

            /*
            |--------------------------------------------------------------------------
            | type
            |--------------------------------------------------------------------------
            */

            if (in_array('type', $columns, true)) {
                $data['type'] = 'space_added';
            }

            /*
            |--------------------------------------------------------------------------
            | is_read
            |--------------------------------------------------------------------------
            */

            if (in_array('is_read', $columns, true)) {
                $data['is_read'] = false;
            }

            /*
            |--------------------------------------------------------------------------
            | Vérifier qu'on a bien quelque chose à insérer
            |--------------------------------------------------------------------------
            */

            if (empty($data)) {
                logger()->warning(
                    'Impossible de créer la notification : aucune colonne compatible.'
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Ajouter timestamps si disponibles
            |--------------------------------------------------------------------------
            */

            if (in_array('created_at', $columns, true)) {
                $data['created_at'] = now();
            }

            if (in_array('updated_at', $columns, true)) {
                $data['updated_at'] = now();
            }

            /*
            |--------------------------------------------------------------------------
            | Insérer notification
            |--------------------------------------------------------------------------
            */

            DB::table('notifications')->insert($data);

        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            |
            | Une erreur de notification ne doit pas empêcher
            | l'ajout de l'utilisateur dans l'espace.
            |
            */

            logger()->error(
                'Erreur création notification space: ' .
                $e->getMessage()
            );
        }
    }
}