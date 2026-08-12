<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentVersionController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpaceMemberController;


Route::post('/auth/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->group(function () {

    // Users - Administrateur uniquement
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Roles
    Route::apiResource('roles', RoleController::class);

    // Folders
    Route::apiResource('folders', FolderController::class);

    // Documents
    Route::apiResource('documents', DocumentController::class);

    // Document Versions
    Route::apiResource(
        'documents/{document}/versions',
        DocumentVersionController::class
    )->except(['update']);

    // Spaces
    Route::apiResource('spaces', SpaceController::class);

    // Announcements
    Route::apiResource('announcements', AnnouncementController::class);

    // Notifications
    Route::apiResource('notifications', NotificationController::class);
    Route::apiResource('space-members', SpaceMemberController::class);
});