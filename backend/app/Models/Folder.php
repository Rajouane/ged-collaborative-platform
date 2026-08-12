<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Folder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent_id',
        'user_id',
    ];

    // Dossier parent
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    // Sous-dossiers
    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    // Propriétaire du dossier
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Documents contenus dans le dossier
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}