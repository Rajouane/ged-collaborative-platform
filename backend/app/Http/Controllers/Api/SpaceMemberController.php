<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SpaceMember;
use Illuminate\Http\Request;

class SpaceMemberController extends Controller
{
    public function index()
    {
        return response()->json(
            SpaceMember::with(['space', 'user'])->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'space_id' => 'required|exists:spaces,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string|max:255',
        ]);

        $member = SpaceMember::create([
            'space_id' => $validated['space_id'],
            'user_id' => $validated['user_id'],
            'role' => $validated['role'] ?? 'member',
        ]);

        return response()->json(
            $member->load(['space', 'user']),
            201
        );
    }

    public function show(string $id)
    {
        $member = SpaceMember::with(['space', 'user'])
            ->findOrFail($id);

        return response()->json($member);
    }

    public function update(Request $request, string $id)
    {
        $member = SpaceMember::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|max:255',
        ]);

        $member->update($validated);

        return response()->json(
            $member->load(['space', 'user'])
        );
    }

    public function destroy(string $id)
    {
        $member = SpaceMember::findOrFail($id);

        $member->delete();

        return response()->json([
            'message' => 'Membre supprimé avec succès.'
        ]);
    }
}