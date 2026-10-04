<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UpworkApiController;
use App\Http\Controllers\UpworkOAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->prefix('upwork')->group(function () {
    Route::get('/status', [UpworkApiController::class, 'status']);
    Route::get('/profile', [UpworkApiController::class, 'profile']);
    Route::get('/connects', [UpworkApiController::class, 'connects']);
    Route::get('/jobs/recommended', [UpworkApiController::class, 'recommendedJobs']);
    Route::get('/jobs/search', [UpworkApiController::class, 'searchJobs']);
    Route::get('/jobs/{reference}', [UpworkApiController::class, 'jobDetails']);
    Route::get('/proposals', [UpworkApiController::class, 'proposals']);
    Route::get('/invitations', [UpworkApiController::class, 'invitations']);
    Route::get('/accounts', [UpworkApiController::class, 'candidateAccounts']);
    Route::post('/accounts/select', [UpworkApiController::class, 'selectAccount']);
    Route::post('/disconnect', [UpworkOAuthController::class, 'disconnect']);
});
