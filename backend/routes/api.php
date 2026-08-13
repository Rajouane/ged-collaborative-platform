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


// =========================
// AUTHENTIFICATION
// =========================

Route::post('/auth/login', [AuthController::class, 'login']);


// =========================
// ROUTES AUTHENTIFIÉES
// =========================

Route::middleware('auth:sanctum')->group(function () {

    // =========================
    // AUTHENTIFICATION
    // =========================

    Route::post('/auth/logout', [AuthController::class, 'logout']);


    // =========================
    // USERS
    // Administrateur uniquement
    // =========================

    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });


    // =========================
    // ROLES
    // =========================

    Route::apiResource('roles', RoleController::class);


    // =========================
    // FOLDERS
    // =========================

    Route::apiResource('folders', FolderController::class);


    // =========================
    // DOCUMENTS
    // =========================

    Route::apiResource('documents', DocumentController::class);


    // =========================
    // DOCUMENT VERSIONS
    // =========================

    Route::apiResource(
        'documents/{document}/versions',
        DocumentVersionController::class
    )->except(['update']);


    // =========================
    // SPACES
    // =========================

    Route::apiResource('spaces', SpaceController::class);


    // =========================
    // ANNOUNCEMENTS
    // =========================

    Route::apiResource('announcements', AnnouncementController::class);


    // =========================
    // NOTIFICATIONS
    // =========================

    // Tout marquer comme lu
    Route::put(
        '/notifications/read-all',
        [NotificationController::class, 'markAllAsRead']
    );

    // CRUD notifications
    Route::apiResource(
        'notifications',
        NotificationController::class
    );


    // =========================
    // SPACE MEMBERS
    // =========================

    Route::apiResource(
        'space-members',
        SpaceMemberController::class
    );

});