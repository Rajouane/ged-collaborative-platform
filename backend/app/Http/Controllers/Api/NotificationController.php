<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     *
     * Récupérer les notifications de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($notifications);
    }

    /**
     * POST /api/notifications
     *
     * Créer une notification.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $notification = Notification::create([
            'user_id' => $validated['user_id'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Notification créée avec succès.',
            'notification' => $notification,
        ], 201);
    }

    /**
     * GET /api/notifications/{id}
     *
     * Afficher une notification.
     */
    public function show(Request $request, string $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($notification);
    }

    /**
     * PUT /api/notifications/{id}
     *
     * Marquer une notification comme lue.
     */
    public function update(Request $request, string $id)
    {
        $notification = Notification::where(
            'user_id',
            $request->user()->id
        )->findOrFail($id);

        $notification->update([
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
            'notification' => $notification,
        ]);
    }

    /**
     * DELETE /api/notifications/{id}
     *
     * Supprimer une notification.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = Notification::where(
            'user_id',
            $request->user()->id
        )->findOrFail($id);

        $notification->delete();

        return response()->json([
            'message' => 'Notification supprimée avec succès.',
        ]);
    }

    /**
     * PUT /api/notifications/read-all
     *
     * Marquer toutes les notifications comme lues.
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues.',
        ]);
    }
}