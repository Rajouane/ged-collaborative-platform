<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * GET /api/announcements
     */
    public function index(Request $request)
    {
        $announcements = Announcement::with('user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }

    /**
     * POST /api/announcements
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Utilisateur non authentifié.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | ROLE
        |--------------------------------------------------------------------------
        */

        $role = $user->role
            ? strtolower(trim($user->role->name))
            : '';

        /*
        |--------------------------------------------------------------------------
        | SEUL ADMIN ET RESPONSABLE
        |--------------------------------------------------------------------------
        */

        if (
            !in_array(
                $role,
                [
                    'administrateur',
                    'responsable',
                ]
            )
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    "Vous n'êtes pas autorisé à publier une annonce.",
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $announcement = Announcement::create([
            'title' =>
                trim($validated['title']),

            'content' =>
                trim($validated['content']),

            'user_id' =>
                $user->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        $users = User::where(
            'is_active',
            true
        )
        ->where(
            'id',
            '!=',
            $user->id
        )
        ->get();

        foreach ($users as $recipient) {

            Notification::create([
                'user_id' =>
                    $recipient->id,

                'title' =>
                    'Nouvelle annonce',

                'message' =>
                    $user->first_name .
                    ' ' .
                    $user->last_name .
                    ' a publié une nouvelle annonce : "' .
                    $announcement->title .
                    '"',

                'is_read' => false,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | LOAD USER
        |--------------------------------------------------------------------------
        */

        $announcement->load('user');

        return response()->json([
            'success' => true,
            'message' =>
                'Annonce créée avec succès.',
            'data' =>
                $announcement,
        ], 201);
    }

    /**
     * GET /api/announcements/{id}
     */
    public function show(
        Request $request,
        string $id
    ) {
        $announcement =
            Announcement::with('user')
                ->find($id);

        if (!$announcement) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Annonce introuvable.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' =>
                $announcement,
        ]);
    }

    /**
     * PUT /api/announcements/{id}
     */
    public function update(
        Request $request,
        string $id
    ) {
        $user = $request->user();

        if (!$user) {

            return response()->json([
                'message' =>
                    'Utilisateur non authentifié.',
            ], 401);
        }

        $role = $user->role
            ? strtolower(trim($user->role->name))
            : '';

        if (
            !in_array(
                $role,
                [
                    'administrateur',
                    'responsable',
                ]
            )
        ) {

            return response()->json([
                'message' =>
                    "Vous n'êtes pas autorisé à modifier une annonce.",
            ], 403);
        }

        $announcement =
            Announcement::find($id);

        if (!$announcement) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Annonce introuvable.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE
        |--------------------------------------------------------------------------
        */

        if (
            $role === 'responsable' &&
            (int) $announcement->user_id !==
            (int) $user->id
        ) {

            return response()->json([
                'message' =>
                    'Vous ne pouvez modifier que vos propres annonces.',
            ], 403);
        }

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

        $announcement->update([
            'title' =>
                trim($validated['title']),

            'content' =>
                trim($validated['content']),
        ]);

        $announcement->load('user');

        return response()->json([
            'success' => true,
            'message' =>
                'Annonce modifiée avec succès.',
            'data' =>
                $announcement,
        ]);
    }

    /**
     * DELETE /api/announcements/{id}
     */
    public function destroy(
        Request $request,
        string $id
    ) {
        $user = $request->user();

        if (!$user) {

            return response()->json([
                'message' =>
                    'Utilisateur non authentifié.',
            ], 401);
        }

        $role = $user->role
            ? strtolower(trim($user->role->name))
            : '';

        if (
            !in_array(
                $role,
                [
                    'administrateur',
                    'responsable',
                ]
            )
        ) {

            return response()->json([
                'message' =>
                    "Vous n'êtes pas autorisé à supprimer une annonce.",
            ], 403);
        }

        $announcement =
            Announcement::find($id);

        if (!$announcement) {

            return response()->json([
                'message' =>
                    'Annonce introuvable.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE
        |--------------------------------------------------------------------------
        */

        if (
            $role === 'responsable' &&
            (int) $announcement->user_id !==
            (int) $user->id
        ) {

            return response()->json([
                'message' =>
                    'Vous ne pouvez supprimer que vos propres annonces.',
            ], 403);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Annonce supprimée avec succès.',
        ]);
    }
}