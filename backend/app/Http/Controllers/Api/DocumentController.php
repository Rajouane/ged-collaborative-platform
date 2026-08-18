<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Notification;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * =========================================================
     * LIST DOCUMENTS
     * =========================================================
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

            $query->where(
                'space_id',
                $space->id
            );

        } else {

            if (!$this->isAdmin($user)) {

                $query->where(function ($q) use ($user) {

                    $q->where(
                        'user_id',
                        $user->id
                    );

                    $q->orWhereHas(
                        'space',
                        function ($spaceQuery) use ($user) {

                            $spaceQuery
                                ->where(
                                    'owner_id',
                                    $user->id
                                )
                                ->orWhereHas(
                                    'members',
                                    function ($memberQuery) use ($user) {

                                        $memberQuery->where(
                                            'users.id',
                                            $user->id
                                        );

                                    }
                                );

                        }
                    );

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
        | SPACE
        |--------------------------------------------------------------------------
        */

        if (!empty($validated['space_id'])) {

            $space = Space::with('members')
                ->find($validated['space_id']);

            if (!$space) {
                return response()->json([
                    'message' => 'Espace introuvable.'
                ], 404);
            }

            if (!$this->canUploadToSpace($user, $space)) {

                return response()->json([
                    'message' =>
                        'Vous n\'êtes pas autorisé à ajouter un document dans cet espace.'
                ], 403);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FOLDER
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

            if (
                $folder->space_id !== null &&
                empty($validated['space_id'])
            ) {

                $validated['space_id'] =
                    $folder->space_id;

                $space = Space::with('members')
                    ->find($folder->space_id);

                if (
                    !$space ||
                    !$this->canUploadToSpace(
                        $user,
                        $space
                    )
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
        | FILE UPLOAD
        |--------------------------------------------------------------------------
        */

        $file = $request->file('file');

        $path = $file->store(
            'documents',
            'public'
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE
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
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        if ($space) {

            $recipients = $space->members
                ->where(
                    'id',
                    '!=',
                    $user->id
                );

            foreach ($recipients as $recipient) {

                Notification::create([
                    'user_id' =>
                        $recipient->id,

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

                    'is_read' =>
                        false,
                ]);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONS
        |--------------------------------------------------------------------------
        */

        $document->load([
            'user:id,first_name,last_name,email',
            'folder',
            'space:id,name,description,owner_id',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Document ajouté avec succès.',
            'data' => $document,
        ], 201);
    }


    /**
     * =========================================================
     * SHOW
     * =========================================================
     */
    public function show(
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
            'user:id,first_name,last_name,email',
            'folder',
            'space:id,name,description,owner_id',
        ])->findOrFail($id);

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
     * PREVIEW
     * =========================================================
     *
     * Cette méthode est volontairement indépendante
     * de auth:sanctum car Chrome doit pouvoir ouvrir
     * directement cette URL.
     *
     * PDF + images + fichiers texte :
     * affichage inline.
     *
     * Word / Excel / PowerPoint :
     * téléchargement car Chrome ne sait pas les afficher
     * nativement.
     */
    public function preview(
        Document $document
    ) {
        if (!$document->file_path) {
            return response()->json([
                'message' =>
                    'Aucun fichier associé à ce document.'
            ], 404);
        }

        $disk = Storage::disk('public');

        if (!$disk->exists($document->file_path)) {

            return response()->json([
                'message' =>
                    'Le fichier physique est introuvable.',
                'path' =>
                    $document->file_path,
            ], 404);
        }

        $fullPath = $disk->path(
            $document->file_path
        );

        $mimeType =
            $document->file_type;

        /*
        |--------------------------------------------------------------------------
        | Si le MIME n'est pas enregistré correctement,
        | Laravel/PHP détermine le MIME du fichier.
        |--------------------------------------------------------------------------
        */

        if (!$mimeType) {

            $detectedMime =
                mime_content_type($fullPath);

            $mimeType =
                $detectedMime ?: 'application/octet-stream';
        }


        /*
        |--------------------------------------------------------------------------
        | Types que Chrome peut afficher
        |--------------------------------------------------------------------------
        */

        $previewable = [
            'application/pdf',

            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',

            'text/plain',
            'text/csv',
            'text/html',

            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'video/webm',
        ];


        /*
        |--------------------------------------------------------------------------
        | Office
        |--------------------------------------------------------------------------
        |
        | Chrome ne peut pas afficher directement DOCX/XLSX/PPTX.
        | On force donc le téléchargement.
        |
        */

        if (!in_array(
            strtolower($mimeType),
            $previewable,
            true
        )) {

            return response()->download(
                $fullPath,
                $document->file_name ?: 'document'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | INLINE
        |--------------------------------------------------------------------------
        */

        return response()->file(
            $fullPath,
            [
                'Content-Type' =>
                    $mimeType,

                'Content-Disposition' =>
                    'inline; filename="' .
                    addslashes(
                        $document->file_name ?: 'document'
                    ) .
                    '"',

                'Cache-Control' =>
                    'private, max-age=0, must-revalidate',

                'Pragma' =>
                    'public',
            ]
        );
    }


    /**
     * =========================================================
     * DOWNLOAD
     * =========================================================
     */
    public function download(
        Request $request,
        Document $document
    ) {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' =>
                    'Utilisateur non authentifié.'
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification accès
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


        if (!$document->file_path) {

            return response()->json([
                'message' =>
                    'Aucun fichier associé à ce document.'
            ], 404);
        }


        $disk = Storage::disk('public');


        if (!$disk->exists($document->file_path)) {

            return response()->json([
                'message' =>
                    'Le fichier physique est introuvable.'
            ], 404);
        }


        $fullPath = $disk->path(
            $document->file_path
        );


        return response()->download(
            $fullPath,
            $document->file_name ?: 'document'
        );
    }


    /**
     * =========================================================
     * DELETE
     * =========================================================
     */
    public function destroy(
        Request $request,
        string $id
    ) {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' =>
                    'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::with([
            'space',
            'user',
        ])->findOrFail($id);


        $role = $user->role
            ? strtolower(
                trim(
                    $user->role->name
                )
            )
            : '';


        $isAdmin =
            $role === 'administrateur';

        $isResponsable =
            $role === 'responsable';

        $isOwner =
            (int) $document->user_id ===
            (int) $user->id;


        if ($isAdmin) {

            // autorisé

        } elseif ($isResponsable) {

            $allowed = false;

            if ($document->space) {

                $allowed =
                    $this->canAccessSpace(
                        $user,
                        $document->space
                    );

            } else {

                $allowed =
                    $isOwner;
            }

            if (!$allowed) {

                return response()->json([
                    'message' =>
                        'Vous ne pouvez supprimer que les documents de votre périmètre.'
                ], 403);
            }

        } elseif ($isOwner) {

            // autorisé

        } else {

            return response()->json([
                'message' =>
                    'Vous n\'êtes pas autorisé à supprimer ce document.'
            ], 403);
        }


        if (
            $document->file_path &&
            Storage::disk('public')->exists(
                $document->file_path
            )
        ) {

            Storage::disk('public')->delete(
                $document->file_path
            );
        }


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
     * UPLOAD SPACE
     * =========================================================
     */
    private function canUploadToSpace(
        User $user,
        Space $space
    ): bool {

        $role = $user->role
            ? strtolower(
                trim(
                    $user->role->name
                )
            )
            : '';


        if ($role === 'administrateur') {
            return true;
        }


        if ($role === 'responsable') {
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
     * ADMIN CHECK
     * =========================================================
     */
    private function isAdmin(
        User $user
    ): bool {

        if (!$user->role) {
            return false;
        }

        return strtolower(
            trim(
                $user->role->name
            )
        ) === 'administrateur';
    }
}