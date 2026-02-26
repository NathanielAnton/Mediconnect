<?php

namespace App\Http\Controllers\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MedecinProfile;
use App\Models\RendezVous;
use App\Models\SecretaireMedecin;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Dashboard du secrétaire avec statistiques
     */
    public function show(Request $request)
    {
        $secretaire = $request->user();

        // Récupérer les médecins liés avec le statut "accepte"
        $medecinsLies = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('statut', 'accepte')
            ->with(['medecin.medecinProfile.specialite'])
            ->get();

        // Récupérer les IDs des profils médecins
        $medecinProfileIds = $medecinsLies->pluck('medecin.medecinProfile.id')->toArray();

        // Statistiques globales (filtrées aux médecins liés)
        $stats = [
            'total_medecins' => count($medecinsLies),
            'total_rdv_aujourdhui' => RendezVous::whereIn('medecin_id', $medecinProfileIds)
                ->whereDate('date_debut', Carbon::today())
                ->count(),
            'total_rdv_semaine' => RendezVous::whereIn('medecin_id', $medecinProfileIds)
                ->whereBetween('date_debut', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])->count(),
        ];

        return response()->json([
            'message' => 'Dashboard Secrétaire',
            'stats' => $stats,
            'medecins' => $medecinsLies->map(function ($liaison) {
                return [
                    'id' => $liaison->medecin->id,
                    'name' => $liaison->medecin->name,
                    'email' => $liaison->medecin->email,
                    'specialite' => $liaison->medecin->medecinProfile?->specialite?->nom ?? 'Non spécifié',
                    'telephone' => $liaison->medecin->medecinProfile?->telephone ?? '',
                    'adresse' => $liaison->medecin->medecinProfile?->adresse ?? '',
                ];
            })
        ]);
    }

    /**
     * Récupérer tous les médecins de la plateforme
     */
    public function getAllMedecins()
    {
        $medecins = User::role('medecin')
            ->with(['medecinProfile.specialite'])
            ->get()
            ->map(function ($medecin) {
                return [
                    'id' => $medecin->id,
                    'name' => $medecin->name,
                    'email' => $medecin->email,
                    'specialite' => $medecin->medecinProfile?->specialite?->nom ?? 'Non spécifié',
                    'telephone' => $medecin->medecinProfile?->telephone ?? '',
                    'adresse' => $medecin->medecinProfile?->adresse ?? '',
                    'ville' => $medecin->medecinProfile?->ville ?? '',
                ];
            });

        return response()->json(['medecins' => $medecins]);
    }

    /**
     * Récupérer les patients
     */
    public function getPatients()
    {
        $patients = User::role('client')
            ->select('id', 'name', 'email', 'phone', 'address')
            ->get();

        return response()->json(['patients' => $patients]);
    }

    /**
     * Récupérer le planning d'un médecin lié
     */
    public function getMedecinPlanning(Request $request, $medecinId)
    {
        $secretaire = $request->user();
        $medecin = User::findOrFail($medecinId);

        // Vérifier que le médecin est lié au secrétaire
        $liaison = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('medecin_id', $medecinId)
            ->where('statut', 'accepte')
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $profile = $medecin->medecinProfile;

        if (!$profile) {
            return response()->json(['message' => 'Profil médecin non trouvé'], 404);
        }

        $horaires = $profile->horaires()->get();
        $indisponibilites = $profile->indisponibilites()->get();
        $rendezVous = RendezVous::where('medecin_id', $profile->id)
            ->with(['client'])
            ->orderBy('date_debut', 'asc')
            ->get();

        return response()->json([
            'medecin' => [
                'id' => $medecin->id,
                'name' => $medecin->name,
                'specialite' => $profile->specialite?->nom ?? 'Non spécifié',
            ],
            'horaires' => $horaires,
            'indisponibilites' => $indisponibilites,
            'rendez_vous' => $rendezVous,
        ]);
    }
}
