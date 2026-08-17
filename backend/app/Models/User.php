<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role_id',
        'department',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function spaces()
    {
        return $this->belongsToMany(
            Space::class,
            'space_members',
            'user_id',
            'space_id'
        )->withPivot('role')
         ->withTimestamps();
    }

    public function spaceMembers()
    {
        return $this->hasMany(SpaceMember::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}