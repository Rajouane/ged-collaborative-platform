<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Document;
use App\Models\Folder;
use App\Models\Space;
use App\Models\Notification;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * =====================================================
     * STATISTIQUES DU DASHBOARD
     * =====================================================
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }


        // =================================================
        // ADMIN
        // role_id = 1
        // =================================================

        if ((int) $user->role_id === 1) {

            return response()->json([

                'type' => 'admin',

                'users' => User::count(),

                'documents' => Document::count(),

                'folders' => Folder::count(),

                'spaces' => Space::count(),

                'notifications' => Notification::where(
                    'user_id',
                    $user->id
                )
                    ->where('is_read', false)
                    ->count(),
            ]);
        }


        // =================================================
        // UTILISATEUR / RESPONSABLE
        // =================================================

        $documents = Document::where(
            'user_id',
            $user->id
        )->count();


        $folders = Folder::where(
            'user_id',
            $user->id
        )->count();


        $spaces = Space::where(
            'owner_id',
            $user->id
        )->count();


        $notifications = Notification::where(
            'user_id',
            $user->id
        )
            ->where('is_read', false)
            ->count();


        return response()->json([

            'type' => 'user',

            'documents' => $documents,

            'folders' => $folders,

            'spaces' => $spaces,

            'notifications' => $notifications,

        ]);
    }
}