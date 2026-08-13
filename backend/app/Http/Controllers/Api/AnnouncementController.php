<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the announcements.
     */
    public function index()
    {
        $announcements = Announcement::with('user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ], 200);
    }


    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        // Vérifier l'utilisateur connecté
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié.',
            ], 401);
        }


        // Validation
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'content' => [
                'required',
                'string',
            ],
        ]);


        // Création de l'annonce
        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'user_id' => $user->id,
        ]);


        // Charger l'utilisateur
        $announcement->load('user');


        return response()->json([
            'success' => true,
            'message' => 'Annonce créée avec succès.',
            'data' => $announcement,
        ], 201);
    }


    /**
     * Display the specified announcement.
     */
    public function show(string $id)
    {
        $announcement = Announcement::with('user')
            ->find($id);


        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Annonce introuvable.',
            ], 404);
        }


        return response()->json([
            'success' => true,
            'data' => $announcement,
        ], 200);
    }


    /**
     * Update the specified announcement.
     */
    public function update(
        Request $request,
        string $id
    ) {
        $announcement = Announcement::find($id);


        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Annonce introuvable.',
            ], 404);
        }


        // Validation
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'content' => [
                'required',
                'string',
            ],
        ]);


        // Modification
        $announcement->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);


        // Charger l'utilisateur
        $announcement->load('user');


        return response()->json([
            'success' => true,
            'message' => 'Annonce modifiée avec succès.',
            'data' => $announcement,
        ], 200);
    }


    /**
     * Remove the specified announcement.
     */
    public function destroy(string $id)
    {
        $announcement = Announcement::find($id);


        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Annonce introuvable.',
            ], 404);
        }


        // Suppression
        $announcement->delete();


        return response()->json([
            'success' => true,
            'message' => 'Annonce supprimée avec succès.',
        ], 200);
    }
}