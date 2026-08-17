<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentVersionController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\SpaceMemberController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DashboardController;


// ======================================================
// AUTH - PUBLIC
// ======================================================

Route::post(
    '/auth/login',
    [AuthController::class, 'login']
);


// ======================================================
// AUTHENTICATED
// ======================================================

Route::middleware('auth:sanctum')->group(function () {


    // ==================================================
    // AUTH
    // ==================================================

    Route::post(
        '/auth/logout',
        [AuthController::class, 'logout']
    );


    // ==================================================
    // DASHBOARD
    // ==================================================

    Route::get(
        '/dashboard/stats',
        [DashboardController::class, 'stats']
    );


    // ==================================================
    // PROFILE / SETTINGS
    // ==================================================

    Route::get(
        '/profile',
        [ProfileController::class, 'show']
    );

    Route::put(
        '/profile',
        [ProfileController::class, 'update']
    );

    Route::put(
        '/profile/password',
        [ProfileController::class, 'updatePassword']
    );


    // ==================================================
    // USERS
    // ADMIN ONLY
    // ==================================================

    Route::middleware('admin')->group(function () {

        Route::apiResource(
            'users',
            UserController::class
        );

    });


    // ==================================================
    // ROLES
    // ==================================================

    Route::apiResource(
        'roles',
        RoleController::class
    );


    // ==================================================
    // FOLDERS
    // ==================================================

    Route::apiResource(
        'folders',
        FolderController::class
    );


    // ==================================================
    // DOCUMENTS
    // ==================================================

    Route::apiResource(
        'documents',
        DocumentController::class
    );


    // ==================================================
    // DOCUMENT VERSIONS
    // ==================================================

    Route::apiResource(
        'documents/{document}/versions',
        DocumentVersionController::class
    )->except([
        'update'
    ]);


    // ==================================================
    // SPACES
    // ==================================================

    Route::get(
        '/spaces',
        [SpaceController::class, 'index']
    );

    Route::post(
        '/spaces',
        [SpaceController::class, 'store']
    );

    Route::get(
        '/spaces/users',
        [SpaceController::class, 'users']
    );

    Route::get(
        '/spaces/{space}',
        [SpaceController::class, 'show']
    );

    Route::put(
        '/spaces/{space}',
        [SpaceController::class, 'update']
    );

    Route::patch(
        '/spaces/{space}',
        [SpaceController::class, 'update']
    );

    Route::delete(
        '/spaces/{space}',
        [SpaceController::class, 'destroy']
    );


    // ==================================================
    // SPACE MEMBERS
    // ==================================================

    Route::get(
        '/spaces/{space}/members',
        [SpaceMemberController::class, 'index']
    );

    Route::post(
        '/spaces/{space}/members',
        [SpaceMemberController::class, 'store']
    );

    Route::put(
        '/spaces/{space}/members/{user}',
        [SpaceMemberController::class, 'update']
    );

    Route::delete(
        '/spaces/{space}/members/{user}',
        [SpaceMemberController::class, 'destroy']
    );


    // ==================================================
    // ANNOUNCEMENTS
    // ==================================================

    Route::apiResource(
        'announcements',
        AnnouncementController::class
    );


    // ==================================================
    // NOTIFICATIONS
    // ==================================================

    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    );

    Route::put(
        '/notifications/read-all',
        [NotificationController::class, 'markAllAsRead']
    );

    Route::get(
        '/notifications/{notification}',
        [NotificationController::class, 'show']
    );

    Route::put(
        '/notifications/{notification}',
        [NotificationController::class, 'update']
    );

    Route::delete(
        '/notifications/{notification}',
        [NotificationController::class, 'destroy']
    );

});