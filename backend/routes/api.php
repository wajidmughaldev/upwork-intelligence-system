<?php

use App\Http\Controllers\Api\UpworkApiController;
use App\Http\Controllers\UpworkOAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('upwork')->group(function () {
    Route::get('/status', [UpworkApiController::class, 'status']);
    Route::get('/profile', [UpworkApiController::class, 'profile']);
    Route::get('/connects', [UpworkApiController::class, 'connects']);
    Route::get('/jobs/recommended', [UpworkApiController::class, 'recommendedJobs']);
    Route::get('/jobs/search', [UpworkApiController::class, 'searchJobs']);
    Route::get('/jobs/{reference}', [UpworkApiController::class, 'jobDetails']);
    Route::get('/proposals', [UpworkApiController::class, 'proposals']);
    Route::get('/invitations', [UpworkApiController::class, 'invitations']);
    Route::post('/disconnect', [UpworkOAuthController::class, 'disconnect']);
});
