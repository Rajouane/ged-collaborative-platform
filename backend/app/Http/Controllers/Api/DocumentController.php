<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * =========================================================
     * LIST DOCUMENTS
     * =========================================================
     *
     * GET /api/documents
     * GET /api/documents?space_id=1
     */
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $query = Document::with([
            'user:id,first_name,last_name,email',
            'folder',
            'space:id,name,description,owner_id',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Filtrer par Space
        |--------------------------------------------------------------------------
        */

        if ($request->filled('space_id')) {

            $space = Space::find($request->space_id);

            if (!$space) {
                return response()->json([
                    'message' => 'Espace introuvable.'
                ], 404);
            }

            /*
            |--------------------------------------------------------------------------
            | Vérification accès
            |--------------------------------------------------------------------------
            */

            if (!$this->canAccessSpace($user, $space)) {
                return response()->json([
                    'message' => 'Vous n\'avez pas accès à cet espace.'
                ], 403);
            }

            $query->where('space_id', $space->id);

        } else {

            /*
            |--------------------------------------------------------------------------
            | Sans space_id
            |--------------------------------------------------------------------------
            |
            | Administrateur voit tout.
            | Les autres voient :
            | - leurs documents
            | - les documents des espaces auxquels ils ont accès
            |
            */

            if (!$this->isAdmin($user)) {

                $query->where(function ($q) use ($user) {

                    $q->where('user_id', $user->id)

                        ->orWhereHas('space', function ($spaceQuery) use ($user) {

                            $spaceQuery
                                ->where('owner_id', $user->id)

                                ->orWhereHas('members', function ($memberQuery) use ($user) {
                                    $memberQuery->where(
                                        'users.id',
                                        $user->id
                                    );
                                });
                        });
                });
            }
        }

        $documents = $query
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }


    /**
     * =========================================================
     * CREATE DOCUMENT
     * =========================================================
     *
     * POST /api/documents
     */
    public function store(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'folder_id' => [
                'nullable',
                'exists:folders,id',
            ],

            'space_id' => [
                'nullable',
                'exists:spaces,id',
            ],

            'file' => [
                'required',
                'file',
                'max:10240',
            ],
        ]);

        $space = null;

        /*
        |--------------------------------------------------------------------------
        | Vérification Space
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['space_id'])) {

            $space = Space::with('members')
                ->findOrFail($validated['space_id']);

            if (!$this->canUploadToSpace($user, $space)) {

                return response()->json([
                    'message' =>
                        'Vous n\'êtes pas autorisé à ajouter un document dans cet espace.'
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification Folder
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['folder_id'])) {

            $folder = \App\Models\Folder::find(
                $validated['folder_id']
            );

            if (!$folder) {
                return response()->json([
                    'message' => 'Dossier introuvable.'
                ], 404);
            }

            /*
            |--------------------------------------------------------------------------
            | Si un espace est sélectionné
            |--------------------------------------------------------------------------
            |
            | Le dossier doit appartenir au même espace.
            |
            */

            if (
                !empty($validated['space_id']) &&
                $folder->space_id !== null &&
                (int) $folder->space_id !==
                (int) $validated['space_id']
            ) {
                return response()->json([
                    'message' =>
                        'Le dossier sélectionné n\'appartient pas à cet espace.'
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Si le dossier appartient à un espace
            |--------------------------------------------------------------------------
            |
            | Le document doit utiliser le même espace.
            |
            */

            if (
                $folder->space_id !== null &&
                empty($validated['space_id'])
            ) {
                $validated['space_id'] = $folder->space_id;

                $space = Space::with('members')
                    ->find($folder->space_id);

                if (
                    !$space ||
                    !$this->canUploadToSpace($user, $space)
                ) {
                    return response()->json([
                        'message' =>
                            'Vous n\'êtes pas autorisé à ajouter un document dans ce dossier.'
                    ], 403);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Upload
        |--------------------------------------------------------------------------
        */

        $file = $request->file('file');

        $path = $file->store(
            'documents',
            'public'
        );

        /*
        |--------------------------------------------------------------------------
        | Création document
        |--------------------------------------------------------------------------
        */

        $document = Document::create([
            'title' =>
                trim($validated['title']),

            'description' =>
                $validated['description'] ?? null,

            'file_name' =>
                $file->getClientOriginalName(),

            'file_path' =>
                $path,

            'file_type' =>
                $file->getClientMimeType(),

            'file_size' =>
                $file->getSize(),

            'folder_id' =>
                $validated['folder_id'] ?? null,

            'user_id' =>
                $user->id,

            'space_id' =>
                $validated['space_id'] ?? null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        if ($space) {

            $recipients = $space->members
                ->where('id', '!=', $user->id);

            foreach ($recipients as $recipient) {

                Notification::create([
                    'user_id' => $recipient->id,

                    'title' =>
                        'Nouveau document',

                    'message' =>
                        $user->first_name .
                        ' ' .
                        $user->last_name .
                        ' a ajouté le document "' .
                        $document->title .
                        '" dans l’espace "' .
                        $space->name .
                        '".',

                    'is_read' => false,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Charger les relations
        |--------------------------------------------------------------------------
        */

        $document->load([
            'user:id,first_name,last_name,email',
            'folder',
            'space:id,name,description,owner_id',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document ajouté avec succès.',
            'data' => $document,
        ], 201);
    }


    /**
     * =========================================================
     * SHOW
     * =========================================================
     *
     * GET /api/documents/{id}
     */
    public function show(Request $request, string $id)
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::with([
            'user:id,first_name,last_name,email',
            'folder',
            'space:id,name,description,owner_id',
        ])->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Vérification accès Space
        |--------------------------------------------------------------------------
        */

        if (
            $document->space &&
            !$this->canAccessSpace(
                $user,
                $document->space
            )
        ) {
            return response()->json([
                'message' =>
                    'Vous n\'avez pas accès à ce document.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $document,
        ]);
    }


    /**
     * =========================================================
     * DELETE
     * =========================================================
     *
     * DELETE /api/documents/{id}
     */
    public function destroy(
        Request $request,
        string $id
    ) {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::with([
            'space',
            'user',
        ])->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Rôle
        |--------------------------------------------------------------------------
        */

        $role = $user->role
            ? strtolower(trim($user->role->name))
            : '';

        $isAdmin =
            $role === 'administrateur';

        $isResponsable =
            $role === 'responsable';

        $isOwner =
            (int) $document->user_id ===
            (int) $user->id;

        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */

        if ($isAdmin) {

            // Administrateur : autorisé

        } elseif ($isResponsable) {

            $allowed = false;

            if ($document->space) {

                $allowed =
                    $this->canAccessSpace(
                        $user,
                        $document->space
                    );

            } else {

                $allowed = $isOwner;
            }

            if (!$allowed) {
                return response()->json([
                    'message' =>
                        'Vous ne pouvez supprimer que les documents de votre périmètre.'
                ], 403);
            }

        } elseif ($isOwner) {

            // Propriétaire : autorisé

        } else {

            return response()->json([
                'message' =>
                    'Vous n\'êtes pas autorisé à supprimer ce document.'
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Suppression fichier physique
        |--------------------------------------------------------------------------
        */

        if (
            $document->file_path &&
            Storage::disk('public')
                ->exists($document->file_path)
        ) {
            Storage::disk('public')
                ->delete($document->file_path);
        }

        /*
        |--------------------------------------------------------------------------
        | Suppression DB
        |--------------------------------------------------------------------------
        */

        $document->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Document supprimé avec succès.'
        ]);
    }


    /**
     * =========================================================
     * ACCESS SPACE
     * =========================================================
     */
    private function canAccessSpace(
        User $user,
        Space $space
    ): bool {

        /*
        |--------------------------------------------------------------------------
        | Administrateur
        |--------------------------------------------------------------------------
        */

        if ($this->isAdmin($user)) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Owner
        |--------------------------------------------------------------------------
        */

        if (
            (int) $space->owner_id ===
            (int) $user->id
        ) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Member
        |--------------------------------------------------------------------------
        */

        return $space->members()
            ->where('users.id', $user->id)
            ->exists();
    }


    /**
     * =========================================================
     * UPLOAD SPACE
     * =========================================================
     */
    private function canUploadToSpace(
        User $user,
        Space $space
    ): bool {

        $role = $user->role
            ? strtolower(trim($user->role->name))
            : '';

        /*
        |--------------------------------------------------------------------------
        | Administrateur
        |--------------------------------------------------------------------------
        */

        if ($role === 'administrateur') {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Responsable
        |--------------------------------------------------------------------------
        */

        if ($role === 'responsable') {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Owner
        |--------------------------------------------------------------------------
        */

        if (
            (int) $space->owner_id ===
            (int) $user->id
        ) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Member
        |--------------------------------------------------------------------------
        */

        return $space->members()
            ->where('users.id', $user->id)
            ->exists();
    }


    /**
     * =========================================================
     * ADMIN CHECK
     * =========================================================
     */
    private function isAdmin(User $user): bool
    {
        if (!$user->role) {
            return false;
        }

        return strtolower(
            trim($user->role->name)
        ) === 'administrateur';
    }
}