<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FolderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $query = Folder::with([
            'user',
            'parent',
            'children',
            'space',
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

            $query->where('space_id', $space->id);
        } else {
            if (!$this->isAdmin($user)) {
                $query->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhereHas('space', function ($spaceQuery) use ($user) {
                            $spaceQuery
                                ->where('owner_id', $user->id)
                                ->orWhereHas('members', function ($memberQuery) use ($user) {
                                    $memberQuery->where('users.id', $user->id);
                                });
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

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:folders,id'],
            'space_id' => ['nullable', 'exists:spaces,id'],
        ]);

        $space = null;

        if (!empty($validated['space_id'])) {
            $space = Space::find($validated['space_id']);

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

        if (!empty($validated['parent_id'])) {
            $parent = Folder::find($validated['parent_id']);

            if (!$parent) {
                return response()->json([
                    'message' => 'Dossier parent introuvable.'
                ], 404);
            }

            if ($parent->space_id) {
                if (
                    $space &&
                    (int) $parent->space_id !== (int) $space->id
                ) {
                    return response()->json([
                        'message' => 'Le dossier parent doit appartenir au même espace.'
                    ], 422);
                }

                if (!$space) {
                    $validated['space_id'] = $parent->space_id;
                }
            }
        }

        $folder = Folder::create([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
            'user_id' => $user->id,
            'space_id' => $validated['space_id'] ?? null,
        ]);

        $folder->load([
            'user',
            'parent',
            'children',
            'space',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dossier créé avec succès.',
            'data' => $folder,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with([
            'user',
            'parent',
            'children',
            'documents',
            'space',
        ])->findOrFail($id);

        if ($folder->space) {
            if (!$this->canAccessSpace($user, $folder->space)) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        } else {
            if (
                !$this->isAdmin($user) &&
                (int) $folder->user_id !== (int) $user->id
            ) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $folder,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with('space')->findOrFail($id);

        if ($folder->space) {
            if (!$this->canAccessSpace($user, $folder->space)) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        } else {
            if (
                !$this->isAdmin($user) &&
                (int) $folder->user_id !== (int) $user->id
            ) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:folders,id'],
        ]);

        if (
            !empty($validated['parent_id']) &&
            (int) $validated['parent_id'] === (int) $folder->id
        ) {
            return response()->json([
                'message' => 'Un dossier ne peut pas être son propre parent.'
            ], 422);
        }

        if (!empty($validated['parent_id'])) {
            $parent = Folder::find($validated['parent_id']);

            if (!$parent) {
                return response()->json([
                    'message' => 'Dossier parent introuvable.'
                ], 404);
            }

            if (
                $folder->space_id &&
                $parent->space_id &&
                (int) $folder->space_id !== (int) $parent->space_id
            ) {
                return response()->json([
                    'message' => 'Le dossier parent doit appartenir au même espace.'
                ], 422);
            }
        }

        $folder->update([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $folder->load([
            'user',
            'parent',
            'children',
            'space',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dossier modifié avec succès.',
            'data' => $folder,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $folder = Folder::with('space')->findOrFail($id);

        if ($folder->space) {
            if (!$this->canAccessSpace($user, $folder->space)) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        } else {
            if (
                !$this->isAdmin($user) &&
                (int) $folder->user_id !== (int) $user->id
            ) {
                return response()->json([
                    'message' => 'Accès refusé.'
                ], 403);
            }
        }

        if ($folder->children()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce dossier car il contient des sous-dossiers.'
            ], 422);
        }

        if ($folder->documents()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce dossier car il contient des documents.'
            ], 422);
        }

        $folder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dossier supprimé avec succès.',
        ]);
    }

    private function canAccessSpace(User $user, Space $space): bool
    {
        if ($this->isAdmin($user)) {
            return true;
        }

        if ((int) $space->owner_id === (int) $user->id) {
            return true;
        }

        return $space->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    private function isAdmin(User $user): bool
    {
        if (!$user->role) {
            return false;
        }

        return strtolower(trim($user->role->name)) === 'administrateur';
    }
}