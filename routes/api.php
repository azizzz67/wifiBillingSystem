<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InternetPackageController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('packages', InternetPackageController::class)->only(['index', 'store', 'update']);
    Route::apiResource('billing', InvoiceController::class)->only(['index', 'store']);
    Route::apiResource('complaints', ComplaintController::class)->only(['index', 'update']);
    Route::get('/reports', [ReportController::class, 'index']);
});
