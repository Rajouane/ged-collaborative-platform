<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FolderController extends Controller
{
    /**
     * =========================================================
     * LIST FOLDERS
     * =========================================================
     *
     * GET /api/folders
     * GET /api/folders?space_id=3
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $query = Folder::with([
            'user:id,first_name,last_name,email',
            'parent:id,name,parent_id,space_id',
            'children:id,name,parent_id,space_id',
            'space:id,name,description,owner_id',
        ]);

        /*
        |--------------------------------------------------------------------------
        | SPACE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('space_id')) {

            $space = Space::find($request->space_id);

            if (!$space) {
                return response()->json([
                    'message' => 'Espace introuvable.'
                ], 404);
            }

            if (!$this->canAccessSpace($user, $space)) {
                return response()->json([
                    'message' => 'Vous n\'avez pas accès à cet espace.'
                ], 403);
            }

            $query->where('space_id', $space->id);
        }

        /*
        |--------------------------------------------------------------------------
        | SANS SPACE
        |--------------------------------------------------------------------------
        */

        else {

            if (!$this->isAdmin($user)) {

                $query->where(function ($q) use ($user) {

                    /*
                     * Ses dossiers personnels
                     */
                    $q->where('user_id', $user->id)

                        /*
                         * OU dossiers des Spaces accessibles
                         */
                        ->orWhereHas('space', function ($spaceQuery) use ($user) {

                            $spaceQuery
                                ->where('owner_id', $user->id)

                                ->orWhereHas(
                                    'members',
                                    function ($memberQuery) use ($user) {
                                        $memberQuery->where(
                                            'users.id',
                                            $user->id
                                        );
                                    }
                                );
                        });
                });
            }
        }

        $folders = $query
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $folders,
        ]);
    }


    /**
     * =========================================================
     * CREATE FOLDER
     * =========================================================
     *
     * POST /api/folders
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'parent_id' => [
                'nullable',
                'exists:folders,id',
            ],

            'space_id' => [
                'nullable',
                'exists:spaces,id',
            ],
        ]);

        $space = null;

        /*
        |--------------------------------------------------------------------------
        | Vérification Space
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['space_id'])) {

            $space = Space::find(
                $validated['space_id']
            );

            if (!$space) {
                return response()->json([
                    'message' => 'Espace introuvable.'
                ], 404);
            }

            if (!$this->canAccessSpace($user, $space)) {
                return response()->json([
                    'message' => 'Vous n\'avez pas accès à cet espace.'
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification dossier parent
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['parent_id'])) {

            $parent = Folder::find(
                $validated['parent_id']
            );

            if (!$parent) {
                return response()->json([
                    'message' => 'Dossier parent introuvable.'
                ], 404);
            }

            /*
             * Un sous-dossier doit appartenir
             * au même Space.
             */
            if ($space) {

                if (
                    (int) $parent->space_id !==
                    (int) $space->id
                ) {
                    return response()->json([
                        'message' =>
                            'Le dossier parent doit appartenir au même espace.'
                    ], 422);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Création
        |--------------------------------------------------------------------------
        */

        $folder = Folder::create([
            'name' => trim($validated['name']),

            'description' =>
                $validated['description'] ?? null,

            'parent_id' =>
                $validated['parent_id'] ?? null,

            'user_id' =>
                $user->id,

            'space_id' =>
                $validated['space_id'] ?? null,
        ]);

        $folder->load([
            'user:id,first_name,last_name,email',
            'parent',
            'children',
            'space:id,name,description,owner_id',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dossier créé avec succès.',
            'data' => $folder,
        ], 201);
    }


    /**
     * =========================================================
     * SHOW
     * =========================================================
     *
     * GET /api/folders/{id}
     */
    public function show(
        Request $request,
        string $id
    ): JsonResponse {

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with([
            'user:id,first_name,last_name,email',
            'parent',
            'children',
            'documents',
            'space:id,name,description,owner_id',
        ])->findOrFail($id);

        if (
            $folder->space &&
            !$this->canAccessSpace(
                $user,
                $folder->space
            )
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        if (
            !$folder->space &&
            !$this->isAdmin($user) &&
            (int) $folder->user_id !== (int) $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $folder,
        ]);
    }


    /**
     * =========================================================
     * UPDATE
     * =========================================================
     *
     * PUT /api/folders/{id}
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with('space')
            ->findOrFail($id);

        if (
            $folder->space &&
            !$this->canAccessSpace(
                $user,
                $folder->space
            )
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        if (
            !$folder->space &&
            !$this->isAdmin($user) &&
            (int) $folder->user_id !== (int) $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'parent_id' => [
                'nullable',
                'exists:folders,id',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Empêcher le dossier d'être son propre parent
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['parent_id']) &&
            (int) $validated['parent_id'] ===
            (int) $folder->id
        ) {
            return response()->json([
                'message' =>
                    'Un dossier ne peut pas être son propre parent.'
            ], 422);
        }

        $folder->update([
            'name' =>
                trim($validated['name']),

            'description' =>
                $validated['description'] ?? null,

            'parent_id' =>
                $validated['parent_id'] ?? null,
        ]);

        $folder->load([
            'user:id,first_name,last_name,email',
            'parent',
            'children',
            'space:id,name,description,owner_id',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dossier modifié avec succès.',
            'data' => $folder,
        ]);
    }


    /**
     * =========================================================
     * DELETE
     * =========================================================
     *
     * DELETE /api/folders/{id}
     */
    public function destroy(
        Request $request,
        string $id
    ): JsonResponse {

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with('space')
            ->findOrFail($id);

        if (
            $folder->space &&
            !$this->canAccessSpace(
                $user,
                $folder->space
            )
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        if (
            !$folder->space &&
            !$this->isAdmin($user) &&
            (int) $folder->user_id !== (int) $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier les sous-dossiers
        |--------------------------------------------------------------------------
        */

        if ($folder->children()->exists()) {
            return response()->json([
                'message' =>
                    'Impossible de supprimer ce dossier car il contient des sous-dossiers.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier les documents
        |--------------------------------------------------------------------------
        */

        if ($folder->documents()->exists()) {
            return response()->json([
                'message' =>
                    'Impossible de supprimer ce dossier car il contient des documents.'
            ], 422);
        }

        $folder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dossier supprimé avec succès.',
        ]);
    }


    /**
     * =========================================================
     * ACCESS SPACE
     * =========================================================
     */
    private function canAccessSpace(
        $user,
        Space $space
    ): bool {

        if ($this->isAdmin($user)) {
            return true;
        }

        if (
            (int) $space->owner_id ===
            (int) $user->id
        ) {
            return true;
        }

        return $space
            ->members()
            ->where(
                'users.id',
                $user->id
            )
            ->exists();
    }


    /**
     * =========================================================
     * ADMIN
     * =========================================================
     */
    private function isAdmin($user): bool
    {
        if (!$user->role) {
            return false;
        }

        return strtolower(
            trim($user->role->name)
        ) === 'administrateur';
    }
}