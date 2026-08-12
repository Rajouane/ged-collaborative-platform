<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    /**
     * GET /api/roles
     */
    public function index()
    {
        return response()->json(
            Role::all()
        );
    }

    /**
     * POST /api/roles
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' =>
                'required|string|unique:roles,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
        ]);

        return response()->json(
            $role,
            201
        );
    }

    /**
     * GET /api/roles/{id}
     */
    public function show(string $id)
    {
        return response()->json(
            Role::findOrFail($id)
        );
    }

    /**
     * PUT /api/roles/{id}
     */
    public function update(
        Request $request,
        string $id
    ) {
        $validated = $request->validate([
            'name' =>
                'required|string|unique:roles,name,' . $id,
        ]);

        $role = Role::findOrFail($id);

        $role->update([
            'name' => $validated['name'],
        ]);

        return response()->json($role);
    }

    /**
     * DELETE /api/roles/{id}
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);

        $role->delete();

        return response()->json([
            'message' =>
                'Rôle supprimé avec succès.'
        ]);
    }
}