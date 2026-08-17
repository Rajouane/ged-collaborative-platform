<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
            ], 401);
        }

        $user->loadMissing('role');

        if (!$user->role) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun rôle associé à cet utilisateur.',
            ], 403);
        }

        $roleName = strtolower(
            trim($user->role->name)
        );

        if ($roleName !== 'administrateur') {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Administrateur uniquement.',
            ], 403);
        }

        return $next($request);
    }
}