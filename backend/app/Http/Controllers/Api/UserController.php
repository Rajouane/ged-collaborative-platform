<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/users
     */
    public function index()
    {
        return response()->json(
            User::with('role')->get()
        );
    }

    /**
     * POST /api/users
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',

            'last_name' => 'required|string|max:255',

            'email' => 'required|email|unique:users,email',

            'password' => 'required|string|min:8',

            'role_id' => 'required|exists:roles,id',

            'department' => 'nullable|string|max:255',

            'phone' => 'nullable|string|max:50',

            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],

            'last_name' => $validated['last_name'],

            'email' => $validated['email'],

            'password' => Hash::make(
                $validated['password']
            ),

            'role_id' => $validated['role_id'],

            'department' =>
                $validated['department'] ?? null,

            'phone' =>
                $validated['phone'] ?? null,

            'is_active' =>
                $validated['is_active'] ?? true,
        ]);

        return response()->json(
            $user->load('role'),
            201
        );
    }

    /**
     * GET /api/users/{id}
     */
    public function show(string $id)
    {
        $user = User::with('role')
            ->findOrFail($id);

        return response()->json($user);
    }

    /**
     * PUT /api/users/{id}
     */
    public function update(
        Request $request,
        string $id
    ) {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',

            'last_name' => 'sometimes|string|max:255',

            'email' =>
                'sometimes|email|unique:users,email,' . $id,

            'password' =>
                'sometimes|nullable|string|min:8',

            'role_id' =>
                'sometimes|exists:roles,id',

            'department' =>
                'nullable|string|max:255',

            'phone' =>
                'nullable|string|max:50',

            'is_active' =>
                'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] =
                Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json(
            $user->fresh()->load('role')
        );
    }

    /**
     * DELETE /api/users/{id}
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json([
            'message' =>
                'Utilisateur supprimé avec succès.'
        ]);
    }
}