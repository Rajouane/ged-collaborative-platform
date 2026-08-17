<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_private',
        'owner_id',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Propriétaire du Space
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'owner_id'
        );
    }

    /**
     * Membres du Space
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'space_members',
            'space_id',
            'user_id'
        )
        ->withPivot('id')
        ->withTimestamps();
    }

    /**
     * Dossiers du Space
     */
    public function folders(): HasMany
    {
        return $this->hasMany(
            Folder::class,
            'space_id'
        );
    }

    /**
     * Documents du Space
     */
    public function documents(): HasMany
    {
        return $this->hasMany(
            Document::class,
            'space_id'
        );
    }
}