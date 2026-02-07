<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GestionnaireController extends Controller
{
    /**
     * Afficher le dashboard du gestionnaire
     */
    public function dashboard()
    {
        return response()->json([
            'message' => 'Bienvenue sur le dashboard gestionnaire',
            'user' => auth()->user(),
            'role' => 'gestionnaire'
        ]);
    }

    /**
     * Obtenir les statistiques
     */
    public function getStatistiques()
    {
        // Exemple de statistiques
        return response()->json([
            'total_users' => 100,
            'total_medecins' => 25,
            'total_rdv' => 350,
        ]);
    }

    /**
     * Gérer les utilisateurs (exemple)
     */
    public function getUsers()
    {
        // Ici vous pouvez ajouter la logique pour récupérer les utilisateurs
        return response()->json([
            'users' => []
        ]);
    }
}
