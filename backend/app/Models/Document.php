<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'folder_id',
        'user_id',
        'space_id',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Dossier du document.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(
            Folder::class,
            'folder_id'
        );
    }

    /**
     * Utilisateur qui a créé le document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /**
     * Espace auquel appartient le document.
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(
            Space::class,
            'space_id'
        );
    }

    /**
     * Versions du document.
     */
    public function versions()
    {
        return $this->hasMany(
            DocumentVersion::class
        );
    }
}