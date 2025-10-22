<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect()->route('login'));

// Dashboard: auth + verified is fine
Route::get('/dashboard', fn() => view('dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


Route::middleware(['auth'])->group(function () {

    // Profile
    Route::get('/profile',  [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::middleware(['role:super-admin'])->group(function () {
        
        //users Controller
        Route::get('/user',               [UsersController::class, 'index'])->name('users.list');
        Route::get('/users/{user}/edit',  [UsersController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}',       [UsersController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}',    [UsersController::class, 'destroy'])->name('users.destroy');

        // Role Controller
        Route::get('/roles',              [RoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/{role}/edit',  [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}',       [RoleController::class, 'update'])->name('roles.update');
    });

    // Task Controller
    Route::middleware('permission:tasks.read')->get('tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::middleware('permission:tasks.create')->post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::middleware('permission:tasks.update')->put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::middleware('permission:tasks.delete')->delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});

require __DIR__ . '/auth.php';
