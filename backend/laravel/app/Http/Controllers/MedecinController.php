<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecretaireMedecin;
use App\Models\GestionnaireMedecin;
use App\Models\User;

class MedecinController extends Controller
{
    /**
     * Récupérer toutes les demandes de liaison en attente
     */
    public function getLiaisonRequests(Request $request)
    {
        $medecin = $request->user();

        // Vérifier que l'utilisateur est bien un médecin
        if (!$medecin->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $demandes = SecretaireMedecin::where('medecin_id', $medecin->id)
            ->where('statut', 'en_attente')
            ->with(['secretaire'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'message' => $demande->message,
                    'created_at' => $demande->created_at,
                    'secretaire' => [
                        'id' => $demande->secretaire->id,
                        'name' => $demande->secretaire->name,
                        'email' => $demande->secretaire->email,
                    ],
                ];
            });

        return response()->json(['demandes' => $demandes]);
    }

    /**
     * Accepter une demande de liaison
     */
    public function acceptLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = SecretaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Demande de liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 400);
        }

        $liaison->update(['statut' => 'accepte']);

        return response()->json([
            'message' => 'Liaison acceptée avec succès',
            'liaison' => $liaison->load(['secretaire']),
        ]);
    }

    /**
     * Refuser une demande de liaison
     */
    public function refuseLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = SecretaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Demande de liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 400);
        }

        $liaison->update(['statut' => 'refuse']);

        return response()->json([
            'message' => 'Liaison refusée',
            'liaison' => $liaison->load(['secretaire']),
        ]);
    }

    /**
     * Récupérer tous les secrétaires liés (statut accepté)
     */
    public function getMesSecretaires(Request $request)
    {
        $medecin = $request->user();

        $secretaires = SecretaireMedecin::where('medecin_id', $medecin->id)
            ->where('statut', 'accepte')
            ->with(['secretaire'])
            ->get()
            ->map(function ($liaison) {
                return [
                    'liaison_id' => $liaison->id,
                    'id' => $liaison->secretaire->id,
                    'name' => $liaison->secretaire->name,
                    'email' => $liaison->secretaire->email,
                    'created_at' => $liaison->created_at,
                ];
            });

        return response()->json(['secretaires' => $secretaires]);
    }

    /**
     * Supprimer une liaison (pour médecin uniquement si acceptée)
     */
    public function deleteLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = SecretaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'accepte') {
            return response()->json(['message' => 'Seules les liaisons acceptées peuvent être supprimées'], 400);
        }

        $liaison->delete();

        return response()->json(['message' => 'Liaison supprimée avec succès']);
    }

    /**
     * Récupérer toutes les liaisons (tous statuts)
     */
    public function getAllLiaisons(Request $request)
    {
        $medecin = $request->user();

        $liaisons = SecretaireMedecin::where('medecin_id', $medecin->id)
            ->with(['secretaire'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($liaison) {
                return [
                    'id' => $liaison->id,
                    'statut' => $liaison->statut,
                    'message' => $liaison->message,
                    'created_at' => $liaison->created_at,
                    'updated_at' => $liaison->updated_at,
                    'secretaire' => [
                        'id' => $liaison->secretaire->id,
                        'name' => $liaison->secretaire->name,
                        'email' => $liaison->secretaire->email,
                    ],
                ];
            });

        return response()->json(['liaisons' => $liaisons]);
    }

    // ============================================
    // MÉTHODES POUR LES LIAISONS AVEC GESTIONNAIRES
    // ============================================

    /**
     * Récupérer toutes les demandes de liaison des gestionnaires en attente
     */
    public function getGestionnaireLiaisonRequests(Request $request)
    {
        $medecin = $request->user();

        if (!$medecin->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $demandes = GestionnaireMedecin::where('medecin_id', $medecin->id)
            ->where('statut', 'en_attente')
            ->with(['gestionnaire'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($demande) {
                return [
                    'id' => $demande->id,
                    'message' => $demande->message,
                    'created_at' => $demande->created_at,
                    'gestionnaire' => [
                        'id' => $demande->gestionnaire->id,
                        'name' => $demande->gestionnaire->name,
                        'email' => $demande->gestionnaire->email,
                    ],
                ];
            });

        return response()->json(['demandes' => $demandes]);
    }

    /**
     * Accepter une demande de liaison d'un gestionnaire
     */
    public function acceptGestionnaireLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = GestionnaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Demande de liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 400);
        }

        $liaison->update(['statut' => 'accepte']);

        return response()->json([
            'message' => 'Liaison acceptée avec succès',
            'liaison' => $liaison->load(['gestionnaire']),
        ]);
    }

    /**
     * Refuser une demande de liaison d'un gestionnaire
     */
    public function refuseGestionnaireLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = GestionnaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Demande de liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 400);
        }

        $liaison->update(['statut' => 'refuse']);

        return response()->json([
            'message' => 'Liaison refusée',
            'liaison' => $liaison->load(['gestionnaire']),
        ]);
    }

    /**
     * Récupérer tous les gestionnaires liés
     */
    public function getMesGestionnaires(Request $request)
    {
        $medecin = $request->user();

        $gestionnaires = GestionnaireMedecin::where('medecin_id', $medecin->id)
            ->where('statut', 'accepte')
            ->with(['gestionnaire'])
            ->get()
            ->map(function ($liaison) {
                return [
                    'liaison_id' => $liaison->id,
                    'id' => $liaison->gestionnaire->id,
                    'name' => $liaison->gestionnaire->name,
                    'email' => $liaison->gestionnaire->email,
                    'created_at' => $liaison->created_at,
                ];
            });

        return response()->json(['gestionnaires' => $gestionnaires]);
    }

    /**
     * Supprimer une liaison avec un gestionnaire (pour médecin uniquement si acceptée)
     */
    public function deleteGestionnaireLiaison(Request $request, $id)
    {
        $medecin = $request->user();

        $liaison = GestionnaireMedecin::where('id', $id)
            ->where('medecin_id', $medecin->id)
            ->first();

        if (!$liaison) {
            return response()->json(['message' => 'Liaison non trouvée'], 404);
        }

        if ($liaison->statut !== 'accepte') {
            return response()->json(['message' => 'Seules les liaisons acceptées peuvent être supprimées'], 400);
        }

        $liaison->delete();

        return response()->json(['message' => 'Liaison supprimée avec succès']);
    }

    /**
     * Récupérer toutes les liaisons gestionnaires (tous statuts)
     */
    public function getAllGestionnaireLiaisons(Request $request)
    {
        $medecin = $request->user();

        $liaisons = GestionnaireMedecin::where('medecin_id', $medecin->id)
            ->with(['gestionnaire'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($liaison) {
                return [
                    'id' => $liaison->id,
                    'statut' => $liaison->statut,
                    'message' => $liaison->message,
                    'created_at' => $liaison->created_at,
                    'updated_at' => $liaison->updated_at,
                    'gestionnaire' => [
                        'id' => $liaison->gestionnaire->id,
                        'name' => $liaison->gestionnaire->name,
                        'email' => $liaison->gestionnaire->email,
                    ],
                ];
            });

        return response()->json(['liaisons' => $liaisons]);
    }
}
