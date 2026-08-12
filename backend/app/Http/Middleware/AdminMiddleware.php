<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role_id != 1) {
            return response()->json([
                'message' => 'Accès refusé. Administrateur uniquement.'
            ], 403);
        }

        return $next($request);
    }
}