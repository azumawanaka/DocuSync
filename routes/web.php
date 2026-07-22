<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/', [DocumentController::class, 'index'])
        ->name('home');

    Route::get('/documents', [DocumentController::class, 'index'])
        ->name('documents.index');

    Route::post('/documents', [DocumentController::class, 'store'])
        ->name('documents.store');

    Route::get('/documents/{document}', [DocumentController::class, 'show'])
        ->name('documents.show');

    Route::put('/documents/{document}', [DocumentController::class, 'update'])
        ->name('documents.update');

    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])
        ->name('documents.destroy');

    Route::post('/documents/{document}/share', [DocumentController::class, 'share'])
        ->name('documents.share');

    Route::put('/documents/{document}/share/{user}', [DocumentController::class, 'updateShare'])
        ->name('documents.share.update');

    Route::delete('/documents/{document}/share/{user}', [DocumentController::class, 'removeShare'])
        ->name('documents.share.remove');

    // Upload routes
    Route::post('/uploads', [UploadController::class, 'store'])
        ->name('uploads.store');

    Route::delete('/uploads/{upload}', [UploadController::class, 'destroy'])
        ->name('uploads.destroy');
});

require __DIR__.'/settings.php';