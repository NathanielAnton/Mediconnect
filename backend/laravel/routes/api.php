<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedecinProfileController;
use App\Http\Controllers\SpecialiteController;
use App\Http\Controllers\MedecinPlanningController;
use App\Http\Controllers\SearchMedecinController;
use App\Http\Controllers\RendezVousController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

// Route de test
Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne !']);
});

// Route publique pour la recherche de médecins
Route::get('/search/medecins', [SearchMedecinController::class, 'search']);
Route::get('/medecin/planningbyid/{id}', [MedecinPlanningController::class, 'getPlanningById']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/medecin/profile', [MedecinProfileController::class, 'show']);
    Route::put('/medecin/profile', [MedecinProfileController::class, 'update']);
    Route::get('/specialites', [SpecialiteController::class, 'index']);
    Route::get('/medecin/planning', [MedecinPlanningController::class, 'getPlanning']);
    Route::get('/medecin/horaires', [MedecinPlanningController::class, 'getHoraires']);
    Route::put('/medecin/horaires', [MedecinPlanningController::class, 'updateHoraires']);
    Route::patch('/medecin/horaires/toggle', [MedecinPlanningController::class, 'toggleHoraire']);
    Route::delete('/medecin/horaires', [MedecinPlanningController::class, 'deleteHoraire']);
    Route::post('/medecin/indisponibilites', [MedecinPlanningController::class, 'addIndisponibilite']);
    Route::delete('/medecin/indisponibilites/{id}', [MedecinPlanningController::class, 'deleteIndisponibilite']);
    Route::post('/rendezvous', [RendezVousController::class, 'store']);
});
