<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
     * Propriétaire de l'espace.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Membres de l'espace.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'space_members',
            'space_id',
            'user_id'
        )->withPivot('role')->withTimestamps();
    }
}
