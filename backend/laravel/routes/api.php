<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedecinProfileController;
use App\Http\Controllers\SpecialiteController;
use App\Http\Controllers\MedecinPlanningController;
use App\Http\Controllers\SearchMedecinController;
use App\Http\Controllers\GestionnaireRequestController;
// Controllers par rôle
use App\Http\Controllers\Client\RendezVousController as ClientRendezVousController;
use App\Http\Controllers\Client\SearchController as ClientSearchController;
use App\Http\Controllers\Client\ProfileController as ClientProfileController;
use App\Http\Controllers\Medecin\RendezVousController as MedecinRendezVousController;
use App\Http\Controllers\Medecin\LiaisonController as MedecinLiaisonController;
use App\Http\Controllers\Medecin\ProfileController as MedecinProfileControllerNamespace;
use App\Http\Controllers\Secretaire\RendezVousController as SecretaireRendezVousController;
use App\Http\Controllers\Secretaire\LiaisonController as SecretaireLiaisonController;
use App\Http\Controllers\Secretaire\DashboardController as SecretaireDashboardController;
use App\Http\Controllers\Gestionnaire\RendezVousController as GestionnaireRendezVousController;
use App\Http\Controllers\Gestionnaire\LiaisonController as GestionnaireLiaisonController;
use App\Http\Controllers\Gestionnaire\DashboardController as GestionnaireDashboardController;
use App\Http\Controllers\SuperAdmin\UserController as SuperAdminUserController;
use App\Http\Controllers\SuperAdmin\RoleController as SuperAdminRoleController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Structured API routes organized by role for better separation of concerns.
| All protected routes require 'auth:sanctum' middleware and appropriate role.
|
*/

// ============================================
// PUBLIC ROUTES - Non-authenticated
// ============================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

Route::get('/test', function () {
    return response()->json(['message' => 'API fonctionne !']);
});

// Public search routes
Route::get('/search/medecins', [SearchMedecinController::class, 'search']);
Route::get('/specialites', [ClientSearchController::class, 'getSpecialites']);

// Routes pour les demandes de gestionnaire
Route::post('/demande-gestionnaire', [GestionnaireRequestController::class, 'store']);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    // Shared resources for authenticated users
    Route::get('/medecin/planningbyid/{id}', [MedecinPlanningController::class, 'getPlanningById']);
    Route::get('/medecin/profile', [MedecinProfileController::class, 'show']);
    Route::put('/medecin/profile', [MedecinProfileController::class, 'update']);
    Route::get('/medecin/planning', [MedecinPlanningController::class, 'getPlanning']);
    Route::get('/medecin/horaires', [MedecinPlanningController::class, 'getHoraires']);
    Route::put('/medecin/horaires', [MedecinPlanningController::class, 'updateHoraires']);
    Route::patch('/medecin/horaires/toggle', [MedecinPlanningController::class, 'toggleHoraire']);
    Route::delete('/medecin/horaires', [MedecinPlanningController::class, 'deleteHoraire']);
    Route::post('/medecin/indisponibilites', [MedecinPlanningController::class, 'addIndisponibilite']);
    Route::delete('/medecin/indisponibilites/{id}', [MedecinPlanningController::class, 'deleteIndisponibilite']);
    Route::post('/rendezvous', [ClientRendezVousController::class, 'store']);


    // ============================================
    // CLIENT ROUTES
    // ============================================
    Route::middleware('role:client')->prefix('client')->name('client.')->group(function () {
        // Profile
        Route::get('/profile', [ClientProfileController::class, 'show']);
        Route::put('/profile', [ClientProfileController::class, 'update']);

        // Rendez-vous
        Route::post('/rendez-vous', [ClientRendezVousController::class, 'store']);
        Route::get('/rendez-vous/{id}', [ClientRendezVousController::class, 'show']);
        Route::get('/rendez-vous', [ClientRendezVousController::class, 'getMyRendezVous']);
        Route::patch('/rendez-vous/{id}/cancel', [ClientRendezVousController::class, 'cancel']);
    });

    // ============================================
    // MEDECIN ROUTES
    // ============================================
    Route::middleware('role:medecin')->prefix('medecin')->name('medecin.')->group(function () {
        // Profile
        Route::get('/profile', [MedecinProfileControllerNamespace::class, 'show']);
        Route::put('/profile', [MedecinProfileControllerNamespace::class, 'update']);

        // Rendez-vous Management
        Route::get('/rendez-vous', [MedecinRendezVousController::class, 'getAll']);
        Route::get('/rendez-vous/today', [MedecinRendezVousController::class, 'getToday']);
        Route::get('/rendez-vous/month', [MedecinRendezVousController::class, 'getThisMonth']);
        Route::get('/rendez-vous/{id}', [MedecinRendezVousController::class, 'show']);
        Route::put('/rendez-vous/{id}', [MedecinRendezVousController::class, 'update']);
        Route::post('/rendez-vous', [ClientRendezVousController::class, 'store']);
        Route::delete('/rendez-vous/{id}', [MedecinRendezVousController::class, 'destroy']);



        // Liaisons with Secrétaires
        Route::prefix('liaisons-secretaire')->name('liaisons.')->group(function () {
            Route::get('/demandes', [MedecinLiaisonController::class, 'getSecretaireRequests']);
            Route::patch('/{id}/accepter', [MedecinLiaisonController::class, 'acceptSecretaire']);
            Route::patch('/{id}/refuser', [MedecinLiaisonController::class, 'refuseSecretaire']);
            Route::get('/', [MedecinLiaisonController::class, 'getMySecretaires']);
            Route::get('/all', [MedecinLiaisonController::class, 'getAllSecretaires']);
            Route::delete('/{id}', [MedecinLiaisonController::class, 'deleteSecretaire']);
        });

        // Liaisons with Gestionnaires
        Route::prefix('liaisons-gestionnaires')->name('liaisons-gestionnaires.')->group(function () {
            Route::get('/demandes', [MedecinLiaisonController::class, 'getGestionnaireRequests']);
            Route::patch('/{id}/accepter', [MedecinLiaisonController::class, 'acceptGestionnaire']);
            Route::patch('/{id}/refuser', [MedecinLiaisonController::class, 'refuseGestionnaire']);
            Route::get('/', [MedecinLiaisonController::class, 'getAllGestionnaires']);
            Route::get('/mes-gestionnaires', [MedecinLiaisonController::class, 'getMyGestionnaires']);
            Route::delete('/{id}', [MedecinLiaisonController::class, 'deleteGestionnaire']);
        });
    });

    // ============================================
    // SECRETAIRE ROUTES
    // ============================================
    Route::middleware('role:secretaire')->prefix('secretaire')->name('secretaire.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [SecretaireDashboardController::class, 'show']);
        Route::get('/medecins/all', [SecretaireDashboardController::class, 'getAllMedecins']);
        Route::get('/patients', [SecretaireDashboardController::class, 'getPatients']);

        // Rendez-vous Management
        Route::prefix('rendez-vous')->name('rendez-vous.')->group(function () {
            Route::post('/', [SecretaireRendezVousController::class, 'store']);
            Route::put('/{id}', [SecretaireRendezVousController::class, 'update']);
            Route::get('/today', [SecretaireRendezVousController::class, 'getTodayRendezVous']);
            Route::get('/medecin/{medecinId}', [SecretaireRendezVousController::class, 'getMedecinRendezVous']);
            Route::patch('/{id}/cancel', [SecretaireRendezVousController::class, 'cancel']);
        });

        // Médecins Management
        Route::prefix('medecins')->name('medecins.')->group(function () {
            Route::get('/{medecinId}/planning', [SecretaireDashboardController::class, 'getMedecinPlanning']);
        });

        // Liaisons with Médecins
        Route::prefix('liaisons')->name('liaisons.')->group(function () {
            Route::post('/', [SecretaireLiaisonController::class, 'sendRequest']);
            Route::get('/', [SecretaireLiaisonController::class, 'getAll']);
            Route::get('/medecins', [SecretaireLiaisonController::class, 'getLinked']);
            Route::delete('/{id}', [SecretaireLiaisonController::class, 'cancel']);
        });
    });

    // ============================================
    // GESTIONNAIRE ROUTES
    // ============================================
    Route::middleware('role:gestionnaire')->prefix('gestionnaire')->name('gestionnaire.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [GestionnaireDashboardController::class, 'show']);
        Route::get('/stats', [GestionnaireDashboardController::class, 'getStats']);
        Route::get('/users', [GestionnaireDashboardController::class, 'getUsers']);

        // Rendez-vous Management
        Route::prefix('rendez-vous')->name('rendez-vous.')->group(function () {
            Route::get('/', [GestionnaireRendezVousController::class, 'getAll']);
            Route::get('/{id}', [GestionnaireRendezVousController::class, 'show']);
            Route::put('/{id}', [GestionnaireRendezVousController::class, 'update']);
            Route::delete('/{id}', [GestionnaireRendezVousController::class, 'delete']);
        });

        // Liaisons with Médecins
        Route::prefix('liaisons')->name('liaisons.')->group(function () {
            Route::post('/', [GestionnaireLiaisonController::class, 'sendRequest']);
            Route::get('/', [GestionnaireLiaisonController::class, 'getAll']);
            Route::get('/medecins', [GestionnaireLiaisonController::class, 'getLinked']);
            Route::delete('/{id}', [GestionnaireLiaisonController::class, 'cancel']);
        });

        // Demandes de gestionnaire
        Route::post('/demande-gestionnaire', [GestionnaireRequestController::class, 'store']);
    });

    // ============================================
    // SUPER-ADMIN ROUTES
    // ============================================
    Route::middleware('role:super-admin')->prefix('super-admin')->name('super-admin.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [SuperAdminDashboardController::class, 'show']);
        Route::get('/users/by-role/{role}', [SuperAdminDashboardController::class, 'getUsersByRole']);

        // User Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [SuperAdminUserController::class, 'getAll']);
            Route::get('/{id}', [SuperAdminUserController::class, 'show']);
            Route::post('/assign-role', [SuperAdminUserController::class, 'assignRole']);
            Route::post('/remove-role', [SuperAdminUserController::class, 'removeRole']);
        });

        // Role Management
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', [SuperAdminRoleController::class, 'getAll']);
            Route::post('/', [SuperAdminRoleController::class, 'create']);
            Route::get('/permissions', [SuperAdminRoleController::class, 'getPermissions']);
            Route::post('/assign-permission', [SuperAdminRoleController::class, 'assignPermission']);
        });
    });

    // ============================================
    // ADMIN ROUTES - Protected
    // ============================================
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/demande-gestionnaire', [GestionnaireRequestController::class, 'index']);
        Route::get('/demande-gestionnaire/{id}', [GestionnaireRequestController::class, 'show']);
        Route::put('/demande-gestionnaire/{id}/statut', [GestionnaireRequestController::class, 'updateStatut']);
    });
});
