<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     */
    public function index(Request $request)
    {
        $notifications = Notification::where(
                'user_id',
                $request->user()->id
            )
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $notifications
        ]);
    }


    /**
     * PUT /api/notifications/{notification}
     */
    public function update(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !=
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $notification->update([
            'is_read' => true
        ]);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
            'data' => $notification
        ]);
    }


    /**
     * PUT /api/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where(
            'user_id',
            $request->user()->id
        )->update([
            'is_read' => true
        ]);

        return response()->json([
            'message' => 'Toutes les notifications sont marquées comme lues.'
        ]);
    }


    /**
     * GET /api/notifications/{notification}
     */
    public function show(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !=
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        return response()->json([
            'data' => $notification
        ]);
    }


    /**
     * DELETE /api/notifications/{notification}
     */
    public function destroy(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !=
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification supprimée.'
        ]);
    }

    /**
     * POST non utilisé.
     */
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Création directe des notifications interdite.'
        ], 405);
    }
}