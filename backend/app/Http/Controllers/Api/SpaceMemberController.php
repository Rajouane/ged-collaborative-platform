<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    /**
     * GET /api/spaces
     */
    public function index()
    {
        $spaces = Space::with([
            'owner',
            'members'
        ])
        ->latest()
        ->get();

        return response()->json($spaces);
    }

    /**
     * POST /api/spaces
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'nullable|boolean',
            'owner_id' => 'required|exists:users,id',
        ]);

        $space = Space::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_private' => $validated['is_private'] ?? false,
            'owner_id' => $validated['owner_id'],
        ]);

        // Ajouter automatiquement le propriétaire
        // comme membre avec le rôle owner
        $space->members()->syncWithoutDetaching([
            $validated['owner_id'] => [
                'role' => 'owner'
            ]
        ]);

        return response()->json(
            $space->load([
                'owner',
                'members'
            ]),
            201
        );
    }

    /**
     * GET /api/spaces/{id}
     */
    public function show(string $id)
    {
        $space = Space::with([
            'owner',
            'members'
        ])->findOrFail($id);

        return response()->json($space);
    }

    /**
     * PUT /api/spaces/{id}
     */
    public function update(Request $request, string $id)
    {
        $space = Space::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'nullable|boolean',
            'owner_id' => 'sometimes|required|exists:users,id',
        ]);

        $space->update($validated);

        // Si le propriétaire change
        if (isset($validated['owner_id'])) {
            $space->members()->syncWithoutDetaching([
                $validated['owner_id'] => [
                    'role' => 'owner'
                ]
            ]);
        }

        return response()->json(
            $space->fresh()->load([
                'owner',
                'members'
            ])
        );
    }

    /**
     * DELETE /api/spaces/{id}
     */
    public function destroy(string $id)
    {
        $space = Space::findOrFail($id);

        $space->delete();

        return response()->json([
            'message' => 'Espace supprimé avec succès.'
        ]);
    }
}