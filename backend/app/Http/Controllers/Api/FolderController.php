<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * Display a listing of folders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Administrateur voit tous les dossiers
        if ($user->role->name === 'Administrateur') {
            return Folder::with('user', 'parent', 'children')->get();
        }

        // Les autres utilisateurs voient uniquement leurs dossiers
        return Folder::with('user', 'parent', 'children')
            ->where('user_id', $user->id)
            ->get();
    }

    /**
     * Store a newly created folder.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
        ]);

        $user = $request->user();

        $folder = Folder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'user_id' => $user->id,
        ]);

        return response()->json($folder, 201);
    }

    /**
     * Display the specified folder.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        $folder = Folder::with('user', 'parent', 'children')
            ->findOrFail($id);

        // Un utilisateur normal ne peut voir que ses propres dossiers
        if (
            $user->role->name !== 'Administrateur'
            && $folder->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        return response()->json($folder);
    }

    /**
     * Update the specified folder.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        $folder = Folder::findOrFail($id);

        // Un utilisateur normal ne peut modifier que ses propres dossiers
        if (
            $user->role->name !== 'Administrateur'
            && $folder->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:folders,id',
            ],
        ]);

        $folder->update([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ]);

        return response()->json($folder);
    }

    /**
     * Remove the specified folder.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        $folder = Folder::findOrFail($id);

        // Un utilisateur normal ne peut supprimer que ses propres dossiers
        if (
            $user->role->name !== 'Administrateur'
            && $folder->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $folder->delete();

        return response()->json([
            'message' => 'Folder deleted successfully.'
        ]);
    }
}