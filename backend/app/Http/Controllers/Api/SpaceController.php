<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SpaceController extends Controller
{
    /**
     * =========================================================
     * LIST SPACES
     * =========================================================
     *
     * ADMIN:
     *   يرى جميع Spaces
     *
     * USER:
     *   يرى فقط Spaces التي يملكها أو تمت إضافته إليها
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $isAdmin = $this->isAdmin($user);

        $query = Space::query()
            ->withCount('members')
            ->with('owner:id,first_name,last_name,email')
            ->orderByDesc('created_at');

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        if ($isAdmin) {

            $spaces = $query->get();

        } else {

            /*
            |--------------------------------------------------------------------------
            | UTILISATEUR
            |--------------------------------------------------------------------------
            |
            | Un utilisateur normal voit uniquement:
            |
            | 1. les spaces dont il est owner
            | 2. les spaces où il est membre
            |
            */

            $spaces = $query
                ->where(function ($q) use ($user) {

                    $q->where('owner_id', $user->id)

                        ->orWhereHas('members', function ($memberQuery) use ($user) {
                            $memberQuery->where('users.id', $user->id);
                        });

                })
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $spaces,
        ]);
    }


    /**
     * =========================================================
     * CREATE SPACE
     * =========================================================
     *
     * Seul ADMIN peut créer un Space.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à créer un espace.'
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

            'is_private' => [
                'nullable',
                'boolean',
            ],
        ]);

        $space = Space::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_private' => $validated['is_private'] ?? false,
            'owner_id' => $user->id,
        ]);

        $space->load([
            'owner:id,first_name,last_name,email'
        ]);

        $space->loadCount('members');

        return response()->json([
            'success' => true,
            'message' => 'Espace créé avec succès.',
            'data' => $space,
        ], 201);
    }


    /**
     * =========================================================
     * SHOW SPACE
     * =========================================================
     *
     * Admin:
     *   peut voir tous les Spaces.
     *
     * User:
     *   peut uniquement voir un Space dont il est membre
     *   ou owner.
     */
    public function show(Request $request, Space $space)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$this->isAdmin($user)) {

            $isOwner = (int) $space->owner_id === (int) $user->id;

            $isMember = $space->members()
                ->where('users.id', $user->id)
                ->exists();

            if (!$isOwner && !$isMember) {
                return response()->json([
                    'message' => 'Vous n\'avez pas accès à cet espace.'
                ], 403);
            }
        }

        $space->load([
            'owner:id,first_name,last_name,email',
            'members:id,first_name,last_name,email',
        ]);

        $space->loadCount('members');

        return response()->json([
            'success' => true,
            'data' => $space,
        ]);
    }


    /**
     * =========================================================
     * USERS
     * =========================================================
     *
     * Utilisé uniquement par l'ADMIN pour choisir
     * les utilisateurs à ajouter à un Space.
     */
    public function users(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'Accès réservé à l\'administrateur.'
            ], 403);
        }

        $search = $request->query('search');

        $query = User::query()
            ->select([
                'id',
                'first_name',
                'last_name',
                'email',
                'role_id',
            ])
            ->orderBy('first_name')
            ->orderBy('last_name');

        if ($search) {

            $query->where(function ($q) use ($search) {

                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");

            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * =========================================================
     * UPDATE
     * =========================================================
     */
    public function update(Request $request, Space $space)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'Accès réservé à l\'administrateur.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_private' => [
                'nullable',
                'boolean',
            ],
        ]);

        $space->update($validated);

        $space->load([
            'owner:id,first_name,last_name,email'
        ]);

        $space->loadCount('members');

        return response()->json([
            'success' => true,
            'message' => 'Espace modifié avec succès.',
            'data' => $space,
        ]);
    }


    /**
     * =========================================================
     * DELETE
     * =========================================================
     */
    public function destroy(Request $request, Space $space)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$this->isAdmin($user)) {
            return response()->json([
                'message' => 'Accès réservé à l\'administrateur.'
            ], 403);
        }

        DB::transaction(function () use ($space) {

            $space->members()->detach();

            $space->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Espace supprimé avec succès.'
        ]);
    }


    /**
     * =========================================================
     * ADMIN CHECK
     * =========================================================
     */
    private function isAdmin(User $user): bool
    {
        /*
        |--------------------------------------------------------------------------
        | إذا كان عندك role relation
        |--------------------------------------------------------------------------
        */

        if ($user->relationLoaded('role')) {

            $role = $user->role;

        } else {

            $role = $user->role()->first();
        }

        if (!$role) {
            return false;
        }

        return strtolower(trim($role->name)) === 'administrateur';
    }
}