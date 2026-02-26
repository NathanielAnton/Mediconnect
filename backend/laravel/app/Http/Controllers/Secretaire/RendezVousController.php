<?php

namespace App\Http\Controllers\Secretaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RendezVous;
use App\Models\User;
use App\Models\SecretaireMedecin;
use Carbon\Carbon;

class RendezVousController extends Controller
{
    /**
     * Secrétaire crée/réserve un rendez-vous pour un patient
     */
    public function store(Request $request)
    {
        $secretaire = $request->user();

        $validated = $request->validate([
            'email' => 'required|email',
            'medecin_id' => 'required|integer|exists:users,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'name' => 'required|string|max:255',
        ]);

        // Chercher l'utilisateur par email
        $user = User::where('email', $validated['email'])->first();
        if ($user) {
            $validated['client_id'] = $user->id;
        }

        // Ajouter automatiquement l'author_id (le secrétaire connecté)
        $validated['author_id'] = $secretaire->id;
        $validated['statut'] = 'confirmé';

        $rendezVous = RendezVous::create($validated);
        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'rendez_vous' => $rendezVous
        ], 201);
    }

    /**
     * Secrétaire met à jour un rendez-vous
     */
    public function update(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'email' => 'nullable|email',
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'name' => 'required|string|max:255',
            'statut' => 'sometimes|string'
        ]);

        // Si email est fourni et différent, chercher le nouvel utilisateur
        if (isset($validated['email']) && $validated['email'] !== $rendezVous->email) {
            $user = User::where('email', $validated['email'])->first();
            if ($user) {
                $validated['client_id'] = $user->id;
            }
        }

        $rendezVous->update($validated);

        return response()->json([
            'message' => 'Rendez-vous mis à jour avec succès',
            'rendez_vous' => $rendezVous
        ], 200);
    }

    /**
     * Secrétaire récupère les rendez-vous d'un médecin lié
     */
    public function getMedecinRendezVous(Request $request, $medecinId)
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
                        'name' => $rdv->client->name ?? $rdv->name,
                        'email' => $rdv->client->email ?? $rdv->email,
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
     * Secrétaire récupère les rendez-vous d'aujourd'hui de ses médecins liés
     */
    public function getTodayRendezVous(Request $request)
    {
        $secretaire = $request->user();

        // Récupérer les médecins liés avec le statut "accepte"
        $medecinsLies = SecretaireMedecin::where('secretaire_id', $secretaire->id)
            ->where('statut', 'accepte')
            ->with(['medecin.medecinProfile'])
            ->get();

        if ($medecinsLies->isEmpty()) {
            return response()->json(['rendez_vous' => []]);
        }

        // Récupérer les IDs des profils médecins
        $medecinProfileIds = $medecinsLies->pluck('medecin.medecinProfile.id')->toArray();

        // Récupérer les rendez-vous d'aujourd'hui
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
     * Secrétaire annule un rendez-vous
     */
    public function cancel(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $rendezVous->update(['statut' => 'annulé']);

        return response()->json([
            'message' => 'Rendez-vous annulé avec succès',
            'rendez_vous' => $rendezVous
        ], 200);
    }
}
