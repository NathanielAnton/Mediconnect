<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedecinProfileController;
use App\Http\Controllers\SpecialiteController;
use App\Http\Controllers\MedecinPlanningController;
use App\Http\Controllers\SearchMedecinController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\GestionnaireController;
use App\Http\Controllers\SecretaireController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\MedecinController;
use App\Http\Controllers\GestionnaireRequestController;

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

// Routes pour les demandes de gestionnaire
Route::post('/demande-gestionnaire', [GestionnaireRequestController::class, 'store']);

// Routes protégées admin pour gérer les demandes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/demande-gestionnaire', [GestionnaireRequestController::class, 'index']);
    Route::get('/demande-gestionnaire/{id}', [GestionnaireRequestController::class, 'show']);
    Route::put('/demande-gestionnaire/{id}/statut', [GestionnaireRequestController::class, 'updateStatut']);
});

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
    Route::put('/rendezvous/{id}', [RendezVousController::class, 'update']);
    Route::delete('/rendezvous/{id}', [RendezVousController::class, 'destroy']);

    // Routes pour le gestionnaire (protégées par le middleware role:gestionnaire)
    Route::middleware('role:gestionnaire')->prefix('gestionnaire')->group(function () {
        Route::get('/dashboard', [GestionnaireController::class, 'dashboard']);
        Route::get('/statistiques', [GestionnaireController::class, 'getStatistiques']);
        Route::get('/users', [GestionnaireController::class, 'getUsers']);

        // Routes pour la gestion des liaisons
        Route::post('/liaisons', [GestionnaireController::class, 'sendLiaisonRequest']);
        Route::get('/liaisons', [GestionnaireController::class, 'getMesLiaisons']);
        Route::delete('/liaisons/{id}', [GestionnaireController::class, 'cancelLiaison']);
        Route::get('/medecins-lies', [GestionnaireController::class, 'getMedecinsLies']);
    });
    // Routes pour le secrétaire (protégées par le middleware role:secretaire)
    Route::middleware('role:secretaire')->prefix('secretaire')->group(function () {
        Route::get('/dashboard', [SecretaireController::class, 'dashboard']);
        Route::get('/medecins', [SecretaireController::class, 'getMedecins']);
        Route::get('/medecins/{medecinId}/planning', [SecretaireController::class, 'getMedecinPlanning']);
        Route::get('/medecins/{medecinId}/rendez-vous', [SecretaireController::class, 'getMedecinRendezVous']);
        Route::get('/rendez-vous/aujourdhui', [SecretaireController::class, 'getRendezVousAujourdhui']);
        Route::get('/patients', [SecretaireController::class, 'getPatients']);

        // Routes pour la gestion des liaisons
        Route::post('/liaisons', [SecretaireController::class, 'sendLiaisonRequest']);
        Route::get('/liaisons', [SecretaireController::class, 'getMesLiaisons']);
        Route::delete('/liaisons/{id}', [SecretaireController::class, 'cancelLiaison']);
        Route::get('/medecins-lies', [SecretaireController::class, 'getMedecinslies']);
    });

    // Routes pour le médecin (protégées par le middleware role:medecin)
    Route::middleware('role:medecin')->prefix('medecin')->group(function () {
        // Routes pour les rendez-vous
        Route::get('/rendez-vous', [RendezVousController::class, 'getMedecinRendezVous']);
        Route::get('/rendez-vous/aujourd-hui', [RendezVousController::class, 'getTodayRendezVous']);
        Route::get('/rendez-vous/mois', [RendezVousController::class, 'getMonthRendezVous']);

        // Routes pour la gestion des liaisons avec secrétaires
        Route::get('/liaisons/demandes', [MedecinController::class, 'getLiaisonRequests']);
        Route::patch('/liaisons/{id}/accepter', [MedecinController::class, 'acceptLiaison']);
        Route::patch('/liaisons/{id}/refuser', [MedecinController::class, 'refuseLiaison']);
        Route::get('/liaisons', [MedecinController::class, 'getAllLiaisons']);
        Route::get('/secretaires', [MedecinController::class, 'getMesSecretaires']);
        Route::delete('/liaisons/{id}', [MedecinController::class, 'deleteLiaison']);

        // Routes pour la gestion des liaisons avec gestionnaires
        Route::get('/liaisons-gestionnaires/demandes', [MedecinController::class, 'getGestionnaireLiaisonRequests']);
        Route::patch('/liaisons-gestionnaires/{id}/accepter', [MedecinController::class, 'acceptGestionnaireLiaison']);
        Route::patch('/liaisons-gestionnaires/{id}/refuser', [MedecinController::class, 'refuseGestionnaireLiaison']);
        Route::get('/liaisons-gestionnaires', [MedecinController::class, 'getAllGestionnaireLiaisons']);
        Route::get('/gestionnaires', [MedecinController::class, 'getMesGestionnaires']);
        Route::delete('/liaisons-gestionnaires/{id}', [MedecinController::class, 'deleteGestionnaireLiaison']);
    });

    // Routes pour le super admin (protégées par le middleware role:super-admin)
    Route::middleware('role:super-admin')->prefix('super-admin')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/users', [SuperAdminController::class, 'getAllUsers']);
        Route::post('/users/assign-role', [SuperAdminController::class, 'assignRole']);
        Route::get('/roles', [SuperAdminController::class, 'getAllRoles']);
        Route::post('/roles', [SuperAdminController::class, 'createRole']);
    });
});
