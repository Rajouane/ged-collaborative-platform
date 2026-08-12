<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est connecté
        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        // Administrateur : voir tous les documents
        if ($user->role && $user->role->name === 'Administrateur') {
            return response()->json(
                Document::with('folder', 'user', 'versions')->get()
            );
        }

        // Autres utilisateurs : voir uniquement leurs documents
        return response()->json(
            Document::with('folder', 'user', 'versions')
                ->where('user_id', $user->id)
                ->get()
        );
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Vérifier l'authentification
        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        // Validation
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255'
            ],

            'description' => [
                'nullable',
                'string'
            ],

            'file' => [
                'required',
                'file',
                'max:10240'
            ],

            'folder_id' => [
                'nullable',
                'exists:folders,id'
            ],
        ]);

        // Vérifier que le fichier a bien été reçu
        if (!$request->hasFile('file')) {
            return response()->json([
                'message' => 'Aucun fichier reçu.'
            ], 422);
        }

        $file = $request->file('file');

        // Vérifier que le fichier est valide
        if (!$file->isValid()) {
            return response()->json([
                'message' => 'Le fichier envoyé est invalide.'
            ], 422);
        }

        // Enregistrer le fichier dans :
        // storage/app/public/documents
        $path = $file->store('documents', 'public');

        // Créer le document dans la base de données
        $document = Document::create([
            'title' => $validated['title'],

            'description' => $validated['description'] ?? null,

            'file_name' => $file->getClientOriginalName(),

            'file_path' => $path,

            'file_type' => $file->getClientMimeType(),

            'file_size' => $file->getSize(),

            'folder_id' => $validated['folder_id'] ?? null,

            'user_id' => $user->id,
        ]);

        // Retourner le document créé
        return response()->json(
            $document->load(
                'folder',
                'user',
                'versions'
            ),
            201
        );
    }

    /**
     * Display the specified document.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::with(
            'folder',
            'user',
            'versions'
        )->findOrFail($id);

        // Administrateur peut voir tous les documents
        // Le propriétaire peut voir son document
        if (
            (!$user->role || $user->role->name !== 'Administrateur')
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        return response()->json($document);
    }

    /**
     * Update the specified document.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::findOrFail($id);

        // Vérifier les permissions
        if (
            (!$user->role || $user->role->name !== 'Administrateur')
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        // Validation
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255'
            ],

            'description' => [
                'nullable',
                'string'
            ],

            'folder_id' => [
                'nullable',
                'exists:folders,id'
            ],

            'file' => [
                'nullable',
                'file',
                'max:10240'
            ],
        ]);

        // Données à mettre à jour
        $data = [
            'title' => $validated['title'],

            'description' => $validated['description'] ?? null,

            'folder_id' => $validated['folder_id'] ?? null,
        ];

        // Si un nouveau fichier est envoyé
        if ($request->hasFile('file')) {

            $file = $request->file('file');

            // Vérifier le fichier
            if (!$file->isValid()) {
                return response()->json([
                    'message' => 'Le fichier envoyé est invalide.'
                ], 422);
            }

            // Supprimer l'ancien fichier
            if ($document->file_path) {
                Storage::disk('public')->delete(
                    $document->file_path
                );
            }

            // Enregistrer le nouveau fichier
            $path = $file->store(
                'documents',
                'public'
            );

            // Mettre à jour les informations du fichier
            $data['file_name'] =
                $file->getClientOriginalName();

            $data['file_path'] =
                $path;

            $data['file_type'] =
                $file->getClientMimeType();

            $data['file_size'] =
                $file->getSize();
        }

        // Mise à jour
        $document->update($data);

        // Retourner le document mis à jour
        return response()->json(
            $document
                ->fresh()
                ->load(
                    'folder',
                    'user',
                    'versions'
                )
        );
    }

    /**
     * Remove the specified document.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié.'
            ], 401);
        }

        $document = Document::findOrFail($id);

        // Vérifier les permissions
        if (
            (!$user->role || $user->role->name !== 'Administrateur')
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        // Supprimer le fichier physique
        if ($document->file_path) {
            Storage::disk('public')->delete(
                $document->file_path
            );
        }

        // Supprimer le document de la base
        $document->delete();

        return response()->json([
            'message' => 'Document supprimé avec succès.'
        ]);
    }
}