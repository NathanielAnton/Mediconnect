<?php

namespace App\Http\Controllers\Gestionnaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\RendezVous;

class DashboardController extends Controller
{
    /**
     * Dashboard du gestionnaire avec statistiques
     */
    public function show(Request $request)
    {
        $totalUsers = User::count();
        $totalMedecins = User::role('medecin')->count();
        $totalSecretaires = User::role('secretaire')->count();
        $totalClients = User::role('client')->count();
        $totalRdv = RendezVous::count();

        return response()->json([
            'message' => 'Dashboard Gestionnaire',
            'stats' => [
                'total_users' => $totalUsers,
                'total_medecins' => $totalMedecins,
                'total_secretaires' => $totalSecretaires,
                'total_clients' => $totalClients,
                'total_rdv' => $totalRdv,
            ]
        ]);
    }

    /**
     * Récupérer les statistiques détaillées
     */
    public function getStats(Request $request)
    {
        $totalUsers = User::count();
        $totalMedecins = User::role('medecin')->count();
        $totalSecretaires = User::role('secretaire')->count();
        $totalClients = User::role('client')->count();
        $totalGestionnaires = User::role('gestionnaire')->count();
        $totalRdv = RendezVous::count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_medecins' => $totalMedecins,
                'total_secretaires' => $totalSecretaires,
                'total_clients' => $totalClients,
                'total_gestionnaires' => $totalGestionnaires,
                'total_rdv' => $totalRdv,
            ]
        ]);
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public function getUsers(Request $request)
    {
        $users = User::with('roles')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'roles' => $user->getRoleNames(),
                ];
            });

        return response()->json([
            'users' => $users,
            'total' => count($users)
        ]);
    }
}
