<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\ProblemController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    
    // Users
    Route::apiResource('users', UserController::class);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Tasks
    Route::apiResource('tasks', TaskController::class);

    // Problems
    Route::apiResource('problems', ProblemController::class);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\API\NotificationController::class, 'destroy']);
});
