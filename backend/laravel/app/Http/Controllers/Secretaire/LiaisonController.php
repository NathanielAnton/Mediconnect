<?php

namespace App\Http\Controllers\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SecretaireMedecin;

class LiaisonController extends Controller
{
    /**
     * Secrétaire envoie une demande de liaison à un médecin
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        $secretaire = $request->user();

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
     * Secrétaire récupère toutes ses liaisons
     */
    public function getAll(Request $request)
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
     * Secrétaire annule une demande de liaison en attente
     */
    public function cancel(Request $request, $id)
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
     * Secrétaire récupère les médecins liés (statut accepté)
     */
    public function getLinked(Request $request)
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
                ];
            });

        return response()->json(['medecins' => $medecins]);
    }
}
