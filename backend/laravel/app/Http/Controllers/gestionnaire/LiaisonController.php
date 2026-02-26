<?php

namespace App\Http\Controllers\Gestionnaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\GestionnaireMedecin;

class LiaisonController extends Controller
{
    /**
     * Gestionnaire envoie une demande de liaison à un médecin
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        $gestionnaire = $request->user();

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

        // Créer la liaison
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
     * Gestionnaire récupère toutes ses liaisons
     */
    public function getAll(Request $request)
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
     * Gestionnaire annule une demande de liaison en attente
     */
    public function cancel(Request $request, $id)
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
     * Gestionnaire récupère les médecins liés (statut accepté)
     */
    public function getLinked(Request $request)
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
                ];
            });

        return response()->json(['medecins' => $medecins]);
    }
}
