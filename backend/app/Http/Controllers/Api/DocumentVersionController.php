<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentVersionController extends Controller
{
    /**
     * Display all versions of a document.
     */
    public function index(Request $request, string $documentId)
    {
        $user = $request->user();

        $document = Document::findOrFail($documentId);

        // Only administrator or document owner can see versions
        if (
            $user->role->name !== 'Administrateur'
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        return response()->json(
            $document->versions()
                ->with('user')
                ->orderBy('version', 'desc')
                ->get()
        );
    }

    /**
     * Create a new version of a document.
     */
    public function store(Request $request, string $documentId)
    {
        $user = $request->user();

        $document = Document::findOrFail($documentId);

        // Only administrator or document owner can create a version
        if (
            $user->role->name !== 'Administrateur'
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        // Get the uploaded file
        $file = $request->file('file');

        // Store the new file
        $path = $file->store('documents/versions', 'public');

        // Get the next version number
        $lastVersion = $document->versions()->max('version');

        $nextVersion = $lastVersion
            ? $lastVersion + 1
            : 1;

        // Create the version
        $version = DocumentVersion::create([
            'document_id' => $document->id,
            'version' => $nextVersion,
            'file_path' => $path,
            'user_id' => $user->id,
        ]);

        return response()->json(
            $version->load('document', 'user'),
            201
        );
    }

    /**
     * Display one version.
     */
    public function show(
        Request $request,
        string $documentId,
        string $versionId
    ) {
        $user = $request->user();

        $document = Document::findOrFail($documentId);

        if (
            $user->role->name !== 'Administrateur'
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $version = DocumentVersion::where('document_id', $documentId)
            ->findOrFail($versionId);

        return response()->json(
            $version->load('document', 'user')
        );
    }

    /**
     * Delete a version.
     */
    public function destroy(
        Request $request,
        string $documentId,
        string $versionId
    ) {
        $user = $request->user();

        $document = Document::findOrFail($documentId);

        // Only administrator or document owner can delete versions
        if (
            $user->role->name !== 'Administrateur'
            && $document->user_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $version = DocumentVersion::where('document_id', $documentId)
            ->findOrFail($versionId);

        // Delete physical file
        if ($version->file_path) {
            Storage::disk('public')->delete($version->file_path);
        }

        // Delete database record
        $version->delete();

        return response()->json([
            'message' => 'Version deleted successfully.'
        ]);
    }
}