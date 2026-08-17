<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Afficher le profil de l'utilisateur connecté
     */
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Modifier le prénom et le nom
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $user = $request->user();

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];

        $user->save();

        return response()->json([
            'message' => 'Profil modifié avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Modifier le mot de passe
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Vérifier le mot de passe actuel
        |--------------------------------------------------------------------------
        */

        if (!Hash::check(
            $validated['current_password'],
            $user->password
        )) {
            throw ValidationException::withMessages([
                'current_password' => [
                    'Le mot de passe actuel est incorrect.'
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Enregistrer le nouveau mot de passe
        |--------------------------------------------------------------------------
        */

        $user->password = Hash::make(
            $validated['password']
        );

        $user->save();

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.',
        ]);
    }
}