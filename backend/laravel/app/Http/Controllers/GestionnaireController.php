<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\GestionnaireMedecin;

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
        $totalUsers = User::count();
        $totalMedecins = User::role('medecin')->count();
        $totalSecretaires = User::role('secretaire')->count();
        $totalRdv = \App\Models\RendezVous::count();

        return response()->json([
            'total_users' => $totalUsers,
            'total_medecins' => $totalMedecins,
            'total_secretaires' => $totalSecretaires,
            'total_rdv' => $totalRdv,
        ]);
    }

    /**
     * Gérer les utilisateurs (exemple)
     */
    public function getUsers()
    {
        $users = User::with('roles')->orderBy('created_at', 'desc')->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'roles' => $user->getRoleNames(),
            ];
        });

        return response()->json([
            'users' => $users
        ]);
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

        $gestionnaire = $request->user();

        if (!$gestionnaire->hasRole('gestionnaire')) {
            return response()->json(['message' => 'Vous devez être gestionnaire pour effectuer cette action'], 403);
        }

        $medecin = User::where('email', $request->email)->first();

        if (!$medecin) {
            return response()->json(['message' => 'Aucun utilisateur trouvé avec cet email'], 404);
        }

        if (!$medecin->hasRole('medecin')) {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un médecin'], 400);
        }

        $liaisonExistante = GestionnaireMedecin::where('gestionnaire_id', $gestionnaire->id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if ($liaisonExistante) {
            if ($liaisonExistante->statut === 'en_attente') {
                return response()->json(['message' => 'Une demande de liaison est déjà en attente pour ce médecin'], 400);
            } elseif ($liaisonExistante->statut === 'accepte') {
                return response()->json(['message' => 'Vous êtes déjà lié(e) à ce médecin'], 400);
            } else {
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

        $liaison = GestionnaireMedecin::create([
            'gestionnaire_id' => $gestionnaire->id,
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
     * Récupérer toutes les liaisons du gestionnaire
     */
    public function getMesLiaisons(Request $request)
    {
        $gestionnaire = $request->user();

        $liaisons = GestionnaireMedecin::where('gestionnaire_id', $gestionnaire->id)
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
        $gestionnaire = $request->user();

        $liaison = GestionnaireMedecin::where('id', $id)
            ->where('gestionnaire_id', $gestionnaire->id)
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
    public function getMedecinsLies(Request $request)
    {
        $gestionnaire = $request->user();

        $medecins = GestionnaireMedecin::where('gestionnaire_id', $gestionnaire->id)
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
