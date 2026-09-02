<?php

use Illuminate\Support\Facades\Route;

// ======================================================
// CONTROLLERS
// ======================================================

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
// DOCUMENT PREVIEW - PUBLIC
// ======================================================

Route::get(
    '/documents/{document}/preview',
    [DocumentController::class, 'preview']
);


// ======================================================
// AUTHENTICATED ROUTES
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
    // PROFILE
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
    // USERS - ADMIN ONLY
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

    /*
    |--------------------------------------------------------------------------
    | LIST DOCUMENTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/documents',
        [DocumentController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | TRASH - LIST
    |--------------------------------------------------------------------------
    |
    | GET /api/documents/trash
    |
    */

    Route::get(
        '/documents/trash',
        [DocumentController::class, 'trash']
    );


    /*
    |--------------------------------------------------------------------------
    | TRASH - RESTORE
    |--------------------------------------------------------------------------
    |
    | PUT /api/documents/{document}/restore
    |
    */

    Route::put(
        '/documents/{document}/restore',
        [DocumentController::class, 'restore']
    );


    /*
    |--------------------------------------------------------------------------
    | TRASH - EMPTY
    |--------------------------------------------------------------------------
    |
    | DELETE /api/documents/trash/empty
    |
    */

    Route::delete(
        '/documents/trash/empty',
        [DocumentController::class, 'emptyTrash']
    );


    /*
    |--------------------------------------------------------------------------
    | ADD DOCUMENT
    |--------------------------------------------------------------------------
    |
    | POST /api/documents
    |
    */

    Route::post(
        '/documents',
        [DocumentController::class, 'store']
    );


    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD DOCUMENT
    |--------------------------------------------------------------------------
    |
    | GET /api/documents/{document}/download
    |
    */

    Route::get(
        '/documents/{document}/download',
        [DocumentController::class, 'download']
    );


    /*
    |--------------------------------------------------------------------------
    | FORCE DELETE
    |--------------------------------------------------------------------------
    |
    | DELETE /api/documents/{document}/force
    |
    */

    Route::delete(
        '/documents/{document}/force',
        [DocumentController::class, 'forceDelete']
    );


    /*
    |--------------------------------------------------------------------------
    | SHOW DOCUMENT
    |--------------------------------------------------------------------------
    |
    | GET /api/documents/{document}
    |
    */

    Route::get(
        '/documents/{document}',
        [DocumentController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | DELETE -> TRASH
    |--------------------------------------------------------------------------
    |
    | DELETE /api/documents/{document}
    |
    */

    Route::delete(
        '/documents/{document}',
        [DocumentController::class, 'destroy']
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