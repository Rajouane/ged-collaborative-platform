<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

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
        'deleted_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | FOLDER
    |--------------------------------------------------------------------------
    */

    public function folder()
    {
        return $this->belongsTo(
            Folder::class,
            'folder_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SPACE
    |--------------------------------------------------------------------------
    */

    public function space()
    {
        return $this->belongsTo(
            Space::class,
            'space_id'
        );
    }
}