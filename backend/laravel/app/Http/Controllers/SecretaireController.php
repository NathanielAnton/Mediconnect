<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\MedecinProfile;
use App\Models\RendezVous;
use App\Models\SecretaireMedecin;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class SecretaireController extends Controller
{
    /**
     * Dashboard du secrétaire avec statistiques globales (uniquement médecins liés)
     */
    public function dashboard(Request $request)
    {
        $secretaire = $request->user();

        // Vérifier que l'utilisateur est bien un secrétaire
        if (!$secretaire->hasRole('secretaire')) {
            return response()->json(['message' => 'Vous devez être secrétaire pour effectuer cette action'], 403);
        }

        // Récupérer les médecins liés avec le statut "accepte"
        // Note: medecin_id dans secretaire_medecin = user_id
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
     * Liste de tous les médecins
     */
    public function getMedecins()
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
     * Planning d'un médecin spécifique
     */
    public function getMedecinPlanning($medecinId)
    {
        $medecin = User::role('medecin')->findOrFail($medecinId);
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

    /**
     * Rendez-vous d'un médecin spécifique
     */
    public function getMedecinRendezVous($medecinId)
    {
        $medecin = User::role('medecin')->findOrFail($medecinId);
        $profile = $medecin->medecinProfile;

        if (!$profile) {
            return response()->json(['message' => 'Profil médecin non trouvé'], 404);
        }

        $rendezVous = RendezVous::where('medecin_id', $profile->id)
            ->with(['client'])
            ->orderBy('date_debut', 'asc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'date_heure' => $rdv->date_debut,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'patient' => [
                        'id' => $rdv->client->id ?? null,
                        'name' => $rdv->client->name ?? null,
                        'email' => $rdv->client->email ?? null,
                    ],
                ];
            });

        return response()->json([
            'medecin' => [
                'id' => $medecin->id,
                'name' => $medecin->name,
            ],
            'rendez_vous' => $rendezVous,
        ]);
    }

    /**
     * Tous les rendez-vous d'aujourd'hui (uniquement des médecins liés)
     */
    public function getRendezVousAujourdhui(Request $request)
    {
        $secretaire = $request->user();

        // Vérifier que l'utilisateur est bien un secrétaire
        if (!$secretaire->hasRole('secretaire')) {
            return response()->json(['message' => 'Vous devez être secrétaire pour effectuer cette action'], 403);
        }

        // Récupérer les médecins liés avec le statut "accepte"
        // Note: medecin_id dans secretaire_medecin = user_id
        $medecinsLies = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('statut', 'accepte')
            ->with(['medecin.medecinProfile'])
            ->get();

        if ($medecinsLies->isEmpty()) {
            return response()->json(['rendez_vous' => []]);
        }

        // Récupérer les IDs des profils médecins
        $medecinProfileIds = $medecinsLies->pluck('medecin.medecinProfile.id')->toArray();

        // Récupérer les rendez-vous d'aujourd'hui pour les médecins liés
        $rendezVous = RendezVous::whereIn('medecin_id', $medecinProfileIds)
            ->whereDate('date_debut', Carbon::today())
            ->with(['medecin.user'])
            ->orderBy('date_debut', 'asc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'date_debut' => $rdv->date_debut,
                    'date_fin' => $rdv->date_fin,
                    'name' => $rdv->name,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'email' => $rdv->email,
                    'medecin' => [
                        'id' => $rdv->medecin?->user_id ?? null,
                        'name' => $rdv->medecin?->user?->name ?? 'Inconnu',
                    ],
                ];
            });

        return response()->json(['rendez_vous' => $rendezVous]);
    }

    /**
     * Envoyer une demande de liaison à un médecin par email
     */
    public function sendLiaisonRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        // Récupérer le secrétaire connecté
        $secretaire = $request->user();

        // Vérifier que l'utilisateur est bien un secrétaire
        if (!$secretaire->hasRole('secretaire')) {
            return response()->json(['message' => 'Vous devez être secrétaire pour effectuer cette action'], 403);
        }

        // Chercher le médecin par email
        $medecin = User::where('email', $request->email)->first();

        if (!$medecin) {
            return response()->json(['message' => 'Aucun utilisateur trouvé avec cet email'], 404);
        }

        // Vérifier que l'utilisateur est bien un médecin
        if (!$medecin->hasRole('medecin')) {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un médecin'], 400);
        }

        // Vérifier si une liaison existe déjà
        $liaisonExistante = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if ($liaisonExistante) {
            if ($liaisonExistante->statut === 'en_attente') {
                return response()->json(['message' => 'Une demande de liaison est déjà en attente pour ce médecin'], 400);
            } elseif ($liaisonExistante->statut === 'accepte') {
                return response()->json(['message' => 'Vous êtes déjà lié(e) à ce médecin'], 400);
            } else {
                // Si refusée, permettre de renvoyer une nouvelle demande
                $liaisonExistante->update([
                    'statut' => 'en_attente',
                    'message' => $request->message,
                ]);
                return response()->json([
                    'message' => 'Nouvelle demande de liaison envoyée',
                    'liaison' => $liaisonExistante,
                ]);
            }
        }

        // Créer la liaison
        $liaison = SecretaireMedecin::create([
            'secretaire_id' => $secretaire->id,
            'medecin_id' => $medecin->id,
            'statut' => 'en_attente',
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Demande de liaison envoyée avec succès',
            'liaison' => $liaison->load(['medecin']),
        ], 201);
    }

    /**
     * Récupérer toutes les liaisons du secrétaire
     */
    public function getMesLiaisons(Request $request)
    {
        $secretaire = $request->user();

        $liaisons = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->with(['medecin.medecinProfile.specialite'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($liaison) {
                return [
                    'id' => $liaison->id,
                    'statut' => $liaison->statut,
                    'message' => $liaison->message,
                    'created_at' => $liaison->created_at,
                    'medecin' => [
                        'id' => $liaison->medecin->id,
                        'name' => $liaison->medecin->name,
                        'email' => $liaison->medecin->email,
                        'specialite' => $liaison->medecin->medecinProfile?->specialite?->nom ?? 'Non spécifié',
                        'telephone' => $liaison->medecin->medecinProfile?->telephone ?? '',
                    ],
                ];
            });

        return response()->json(['liaisons' => $liaisons]);
    }

    /**
     * Annuler une demande de liaison en attente
     */
    public function cancelLiaison(Request $request, $id)
    {
        $secretaire = $request->user();

        $liaison = SecretaireMedecin::where('id', $id)
            ->where('secretaire_id', $secretaire->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'en_attente') {
            return response()->json(['message' => 'Seules les demandes en attente peuvent être annulées'], 400);
        }

        $liaison->delete();

        return response()->json(['message' => 'Demande de liaison annulée']);
    }

    /**
     * Récupérer les médecins liés (statut accepté)
     */
    public function getMedecinslies(Request $request)
    {
        $secretaire = $request->user();

        $medecins = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('statut', 'accepte')
            ->with(['medecin.medecinProfile.specialite'])
            ->get()
            ->map(function ($liaison) {
                return [
                    'liaison_id' => $liaison->id,
                    'id' => $liaison->medecin->id,
                    'name' => $liaison->medecin->name,
                    'email' => $liaison->medecin->email,
                    'specialite' => $liaison->medecin->medecinProfile?->specialite?->nom ?? 'Non spécifié',
                    'telephone' => $liaison->medecin->medecinProfile?->telephone ?? '',
                    'adresse' => $liaison->medecin->medecinProfile?->adresse ?? '',
                    'ville' => $liaison->medecin->medecinProfile?->ville ?? '',
                ];
            });

        return response()->json(['medecins' => $medecins]);
    }
}
