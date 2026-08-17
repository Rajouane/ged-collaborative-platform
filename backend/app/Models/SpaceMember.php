<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpaceMember extends Model
{
    use HasFactory;

    protected $table = 'space_members';

    protected $fillable = [
        'space_id',
        'user_id',
        'role',
    ];

    public function space()
    {
        return $this->belongsTo(
            Space::class,
            'space_id'
        );
    }

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }
}