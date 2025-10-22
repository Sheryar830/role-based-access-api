<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UsersApiController;
use App\Http\Controllers\Api\RoleApiController;
use App\Http\Controllers\Api\TaskApiController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        
        //Auth Controller
        Route::post('/logout',      [AuthController::class, 'logout']);
        Route::get('/me',           [AuthController::class, 'me']);
    });
});


Route::middleware('auth:sanctum')->group(function () {

    //Profile controller
    Route::get('/profile',        [ProfileController::class, 'show']);
    Route::put('/profile',        [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    //Users Api Controller
    Route::get('/users',        [UsersApiController::class, 'index'])->middleware('permission:users.read');
    Route::get('/users/{user}', [UsersApiController::class, 'show'])->middleware('permission:users.read');
    Route::put('/users/{user}', [UsersApiController::class, 'update'])->middleware('permission:users.update');
    Route::delete('/users/{user}', [UsersApiController::class, 'destroy'])->middleware('permission:users.delete');

    //Role Api Controller
    Route::get('/roles',        [RoleApiController::class, 'index'])->middleware('permission:roles.read');
    Route::get('/roles/{role}', [RoleApiController::class, 'show'])->middleware('permission:roles.read');
    Route::put('/roles/{role}', [RoleApiController::class, 'update'])->middleware('permission:roles.update');

    //Task Api Controller
    Route::get('/tasks',        [TaskApiController::class, 'index'])->middleware('permission:tasks.read');
    Route::post('/tasks',        [TaskApiController::class, 'store'])->middleware('permission:tasks.create');
    Route::get('/tasks/{task}', [TaskApiController::class, 'show'])->middleware('permission:tasks.read');
    Route::put('/tasks/{task}', [TaskApiController::class, 'update'])->middleware('permission:tasks.update');
    Route::delete('/tasks/{task}', [TaskApiController::class, 'destroy'])->middleware('permission:tasks.delete');
});
