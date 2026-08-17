<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
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

        $allowedRoles = array_map(
            fn ($role) => strtolower(trim($role)),
            $roles
        );

        if (!in_array($roleName, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé.',
                'role' => $user->role->name,
                'required_roles' => $roles,
            ], 403);
        }

        return $next($request);
    }
}