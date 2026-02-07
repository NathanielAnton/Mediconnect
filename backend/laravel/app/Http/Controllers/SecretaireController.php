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
     * Dashboard du secrétaire avec statistiques globales
     */
    public function dashboard()
    {
        // Récupérer tous les médecins
        $medecins = User::role('medecin')
            ->with(['medecinProfile.specialite'])
            ->get();

        // Statistiques globales
        $stats = [
            'total_medecins' => $medecins->count(),
            'total_rdv_aujourdhui' => RendezVous::whereDate('date_heure', Carbon::today())->count(),
            'total_rdv_semaine' => RendezVous::whereBetween('date_heure', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
            'total_patients' => User::role('client')->count(),
        ];

        return response()->json([
            'message' => 'Dashboard Secrétaire',
            'stats' => $stats,
            'medecins' => $medecins->map(function ($medecin) {
                return [
                    'id' => $medecin->id,
                    'name' => $medecin->name,
                    'email' => $medecin->email,
                    'specialite' => $medecin->medecinProfile?->specialite?->nom ?? 'Non spécifié',
                    'telephone' => $medecin->medecinProfile?->telephone ?? '',
                    'adresse' => $medecin->medecinProfile?->adresse ?? '',
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

        return response()->json([
            'medecin' => [
                'id' => $medecin->id,
                'name' => $medecin->name,
                'specialite' => $profile->specialite?->nom ?? 'Non spécifié',
            ],
            'horaires' => $horaires,
            'indisponibilites' => $indisponibilites,
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
            ->with(['patient'])
            ->orderBy('date_heure', 'asc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'date_heure' => $rdv->date_heure,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'patient' => [
                        'id' => $rdv->patient->id,
                        'name' => $rdv->patient->name,
                        'email' => $rdv->patient->email,
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
     * Tous les rendez-vous d'aujourd'hui
     */
    public function getRendezVousAujourdhui()
    {
        $rendezVous = RendezVous::whereDate('date_heure', Carbon::today())
            ->with(['patient', 'medecinProfile.user'])
            ->orderBy('date_heure', 'asc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'date_heure' => $rdv->date_heure,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'patient' => [
                        'id' => $rdv->patient->id,
                        'name' => $rdv->patient->name,
                        'email' => $rdv->patient->email,
                    ],
                    'medecin' => [
                        'id' => $rdv->medecinProfile->user->id,
                        'name' => $rdv->medecinProfile->user->name,
                    ],
                ];
            });

        return response()->json(['rendez_vous' => $rendezVous]);
    }

    /**
     * Liste de tous les patients
     */
    public function getPatients()
    {
        $patients = User::role('client')
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'email' => $patient->email,
                    'created_at' => $patient->created_at,
                ];
            });

        return response()->json(['patients' => $patients]);
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
