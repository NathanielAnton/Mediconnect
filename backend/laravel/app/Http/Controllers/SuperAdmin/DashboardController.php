<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\RendezVous;

class DashboardController extends Controller
{
    /**
     * Dashboard du SuperAdmin avec statistiques globales
     */
    public function show(Request $request)
    {
        $totalUsers = User::count();
        $totalMedecins = User::role('medecin')->count();
        $totalSecretaires = User::role('secretaire')->count();
        $totalClients = User::role('client')->count();
        $totalGestionnaires = User::role('gestionnaire')->count();
        $totalRdv = RendezVous::count();
        $totalRoles = \Spatie\Permission\Models\Role::count();

        return response()->json([
            'message' => 'Dashboard SuperAdmin',
            'stats' => [
                'total_users' => $totalUsers,
                'total_roles' => $totalRoles,
                'total_medecins' => $totalMedecins,
                'total_secretaires' => $totalSecretaires,
                'total_clients' => $totalClients,
                'total_gestionnaires' => $totalGestionnaires,
                'total_rdv' => $totalRdv,
            ]
        ]);
    }

    /**
     * Récupérer les utilisateurs par rôle
     */
    public function getUsersByRole($role)
    {
        $users = User::role($role)
            ->select('id', 'name', 'email', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'role' => $role,
            'users' => $users,
            'total' => count($users)
        ]);
    }
}
