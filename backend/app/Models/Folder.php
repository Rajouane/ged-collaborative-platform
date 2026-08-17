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
        'description',
        'space_id',
        'user_id',
        'parent_id',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(
            Space::class,
            'space_id'
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            Folder::class,
            'parent_id'
        );
    }

    public function children(): HasMany
    {
        return $this->hasMany(
            Folder::class,
            'parent_id'
        );
    }

    public function documents(): HasMany
    {
        return $this->hasMany(
            Document::class,
            'folder_id'
        );
    }
}