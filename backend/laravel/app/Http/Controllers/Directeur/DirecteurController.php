<?php

namespace App\Http\Controllers\Directeur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Directeur;
use App\Models\Hopital;
use App\Models\MedecinProfile;
use App\Models\Gestionnaire;
use App\Models\Secretaire;
use App\Models\RendezVous;

class DirecteurController extends Controller
{
    /**
     * Dashboard du directeur avec statistiques
     */
    public function dashboard(Request $request)
    {
        $directeur = Directeur::where('user_id', $request->user()->id)->first();

        if (!$directeur) {
            return response()->json([
                'message' => 'Profil directeur non trouvé'
            ], 404);
        }

        $hopital = $directeur->hopital;
        $hopitalId = $directeur->hopital_id;

        // Compter les médecins de l'hôpital
        $medecinUserIds = MedecinProfile::where('hopital_id', $hopitalId)->pluck('user_id');
        $totalMedecins = $medecinUserIds->count();

        // Compter les gestionnaires de l'hôpital
        $gestionnaireUserIds = Gestionnaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $totalGestionnaires = $gestionnaireUserIds->count();

        // Compter les secrétaires de l'hôpital
        $secretaireUserIds = Secretaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $totalSecretaires = $secretaireUserIds->count();

        // Combiner tous les IDs des utilisateurs de l'hôpital
        $hopitalUserIds = collect()
            ->merge($medecinUserIds)
            ->merge($gestionnaireUserIds)
            ->merge($secretaireUserIds)
            ->unique()
            ->values();

        $totalUsers = $hopitalUserIds->count() + 1; // +1 pour le directeur
        $totalClients = User::role('client')->count();
        $totalRdv = RendezVous::whereIn('medecin_id', $medecinUserIds)->count();

        return response()->json([
            'message' => 'Dashboard Directeur',
            'directeur' => [
                'id' => $directeur->id,
                'name' => $directeur->name,
                'hopital' => [
                    'id' => $hopital->id,
                    'name' => $hopital->name,
                    'adresse' => $hopital->adresse,
                    'telephone' => $hopital->telephone,
                    'ville' => $hopital->ville,
                ]
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'total_medecins' => $totalMedecins,
                'total_gestionnaires' => $totalGestionnaires,
                'total_secretaires' => $totalSecretaires,
                'total_rdv' => $totalRdv,
            ]
        ]);
    }

    /**
     * Récupérer les statistiques détaillées
     */
    public function getStats(Request $request)
    {
        $directeur = Directeur::where('user_id', $request->user()->id)->first();

        if (!$directeur) {
            return response()->json([
                'message' => 'Profil directeur non trouvé'
            ], 404);
        }

        $hopitalId = $directeur->hopital_id;

        // Récupérer les statistiques de l'hôpital
        $medecinUserIds = MedecinProfile::where('hopital_id', $hopitalId)->pluck('user_id');
        $gestionnaireUserIds = Gestionnaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $secretaireUserIds = Secretaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $directeurUserIds = Directeur::where('hopital_id', $hopitalId)->pluck('user_id');

        // Combiner tous les IDs
        $hopitalUserIds = collect()
            ->merge($medecinUserIds)
            ->merge($gestionnaireUserIds)
            ->merge($secretaireUserIds)
            ->merge($directeurUserIds)
            ->unique()
            ->values();

        $totalUsers = $hopitalUserIds->count();
        $totalMedecins = $medecinUserIds->count();
        $totalSecretaires = $secretaireUserIds->count();
        $totalGestionnaires = $gestionnaireUserIds->count();
        $totalDirecteurs = $directeurUserIds->count();
        $totalRdv = RendezVous::whereIn('medecin_id', $medecinUserIds)->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_medecins' => $totalMedecins,
                'total_gestionnaires' => $totalGestionnaires,
                'total_secretaires' => $totalSecretaires,
                'total_directeurs' => $totalDirecteurs,
                'total_rdv' => $totalRdv,
            ]
        ]);
    }

    /**
     * Récupérer les utilisateurs liés au même hôpital
     */
    public function getUsers(Request $request)
    {
        $directeur = Directeur::where('user_id', $request->user()->id)->first();

        if (!$directeur) {
            return response()->json([
                'message' => 'Profil directeur non trouvé'
            ], 404);
        }

        $hopitalId = $directeur->hopital_id;

        // Récupérer les IDs des utilisateurs liés à l'hôpital
        $medecinUserIds = MedecinProfile::where('hopital_id', $hopitalId)->pluck('user_id');
        $gestionnaireUserIds = Gestionnaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $secretaireUserIds = Secretaire::where('hopital_id', $hopitalId)->pluck('user_id');
        $directeurUserIds = Directeur::where('hopital_id', $hopitalId)->pluck('user_id');

        // Combiner tous les IDs et supprimer les doublons
        $userIds = collect()
            ->merge($medecinUserIds)
            ->merge($gestionnaireUserIds)
            ->merge($secretaireUserIds)
            ->merge($directeurUserIds)
            ->unique()
            ->values();

        // Récupérer les utilisateurs
        $users = User::whereIn('id', $userIds)
            ->with('roles')
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

    /**
     * Récupérer l'hôpital du directeur
     */
    public function getHopital(Request $request)
    {
        $directeur = Directeur::where('user_id', $request->user()->id)->first();

        if (!$directeur) {
            return response()->json([
                'message' => 'Profil directeur non trouvé'
            ], 404);
        }

        $hopital = $directeur->hopital;

        return response()->json([
            'hopital' => [
                'id' => $hopital->id,
                'name' => $hopital->name,
                'adresse' => $hopital->adresse,
                'telephone' => $hopital->telephone,
                'ville' => $hopital->ville,
                'created_at' => $hopital->created_at,
            ]
        ]);
    }
}
