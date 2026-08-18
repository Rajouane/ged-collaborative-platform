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
//
// Cette route reste hors auth:sanctum afin de permettre
// au navigateur d'ouvrir directement un PDF ou une image.
//
// Exemple :
// http://127.0.0.1:8000/api/documents/1/preview
//
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
    |
    | GET /api/documents
    |
    | Pour un espace :
    |
    | GET /api/documents?space_id=1
    |
    */

    Route::get(
        '/documents',
        [DocumentController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | ADD DOCUMENT
    |--------------------------------------------------------------------------
    |
    | POST /api/documents
    |
    | Le fichier est envoyé avec FormData.
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
    | DELETE DOCUMENT
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

    /*
    |--------------------------------------------------------------------------
    | LIST SPACES
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/spaces',
        [SpaceController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | CREATE SPACE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/spaces',
        [SpaceController::class, 'store']
    );


    /*
    |--------------------------------------------------------------------------
    | USERS AVAILABLE FOR SPACE
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/spaces/users',
        [SpaceController::class, 'users']
    );


    /*
    |--------------------------------------------------------------------------
    | SHOW SPACE
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/spaces/{space}',
        [SpaceController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | UPDATE SPACE
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/spaces/{space}',
        [SpaceController::class, 'update']
    );

    Route::patch(
        '/spaces/{space}',
        [SpaceController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | DELETE SPACE
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/spaces/{space}',
        [SpaceController::class, 'destroy']
    );


    // ==================================================
    // SPACE MEMBERS
    // ==================================================

    /*
    |--------------------------------------------------------------------------
    | LIST MEMBERS
    |--------------------------------------------------------------------------
    |
    | GET /api/spaces/{space}/members
    |
    */

    Route::get(
        '/spaces/{space}/members',
        [SpaceMemberController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | ADD MEMBER
    |--------------------------------------------------------------------------
    |
    | POST /api/spaces/{space}/members
    |
    */

    Route::post(
        '/spaces/{space}/members',
        [SpaceMemberController::class, 'store']
    );


    /*
    |--------------------------------------------------------------------------
    | UPDATE MEMBER
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/spaces/{space}/members/{user}',
        [SpaceMemberController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | REMOVE MEMBER
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | LIST NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    );


    /*
    |--------------------------------------------------------------------------
    | MARK ALL AS READ
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/notifications/read-all',
        [NotificationController::class, 'markAllAsRead']
    );


    /*
    |--------------------------------------------------------------------------
    | SHOW NOTIFICATION
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/notifications/{notification}',
        [NotificationController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | MARK NOTIFICATION AS READ
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/notifications/{notification}',
        [NotificationController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | DELETE NOTIFICATION
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/notifications/{notification}',
        [NotificationController::class, 'destroy']
    );

});