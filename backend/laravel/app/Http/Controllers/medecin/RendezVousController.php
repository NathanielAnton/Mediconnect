<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RendezVous;
use Carbon\Carbon;

class RendezVousController extends Controller
{
    /**
     * Médecin récupère ses rendez-vous
     */
    public function getAll(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $medecin = $user->medecinProfile;

        $rendezVous = RendezVous::where('medecin_id', $medecin->id)
            ->orderBy('date_debut', 'desc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'name' => $rdv->name,
                    'email' => $rdv->email,
                    'date_debut' => $rdv->date_debut,
                    'date_fin' => $rdv->date_fin,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'notes' => $rdv->notes
                ];
            });

        return response()->json([
            'rendez_vous' => $rendezVous
        ]);
    }

    /**
     * Médecin récupère ses rendez-vous d'aujourd'hui
     */
    public function getToday(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $medecin = $user->medecinProfile;

        $today = now()->startOfDay();
        $tomorrow = now()->addDay()->startOfDay();

        $rendezVous = RendezVous::where('medecin_id', $medecin->id)
            ->whereBetween('date_debut', [$today, $tomorrow])
            ->orderBy('date_debut', 'asc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'name' => $rdv->name,
                    'email' => $rdv->email,
                    'date_debut' => $rdv->date_debut,
                    'date_fin' => $rdv->date_fin,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'notes' => $rdv->notes
                ];
            });

        return response()->json([
            'rendez_vous' => $rendezVous,
            'count' => count($rendezVous)
        ]);
    }

    /**
     * Médecin récupère ses rendez-vous du mois
     */
    public function getThisMonth(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $medecin = $user->medecinProfile;

        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $rendezVous = RendezVous::where('medecin_id', $medecin->id)
            ->whereBetween('date_debut', [$startOfMonth, $endOfMonth])
            ->orderBy('date_debut', 'desc')
            ->get()
            ->map(function ($rdv) {
                return [
                    'id' => $rdv->id,
                    'name' => $rdv->name,
                    'email' => $rdv->email,
                    'date_debut' => $rdv->date_debut,
                    'date_fin' => $rdv->date_fin,
                    'motif' => $rdv->motif,
                    'statut' => $rdv->statut,
                    'notes' => $rdv->notes
                ];
            });

        return response()->json([
            'rendez_vous' => $rendezVous,
            'count' => count($rendezVous)
        ]);
    }

    /**
     * Médecin met à jour un rendez-vous (statut, notes, etc)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->hasRole('medecin')) {
            return response()->json(['message' => 'Vous devez être médecin pour effectuer cette action'], 403);
        }

        $rendezVous = RendezVous::findOrFail($id);

        // Vérifier que le rendez-vous appartient au médecin
        $medecinProfile = $user->medecinProfile;
        if ($rendezVous->medecin_id !== $medecinProfile->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'statut' => 'sometimes|string',
            'notes' => 'sometimes|nullable|string|max:1000'
        ]);

        // Si le statut passe à "confirmé", ajouter l'ID du médecin qui confirme
        if (isset($validated['statut']) && $validated['statut'] === 'confirmé' && $rendezVous->statut !== 'confirmé') {
            $validated['confirmed_by'] = $user->id;
        }

        $rendezVous->update($validated);

        return response()->json([
            'message' => 'Rendez-vous mis à jour avec succès',
            'rendez_vous' => $rendezVous
        ], 200);
    }

    /**
     * Médecin récupère un rendez-vous spécifique
     */
    public function show($id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        return response()->json([
            'rendez_vous' => [
                'id' => $rendezVous->id,
                'name' => $rendezVous->name,
                'email' => $rendezVous->email,
                'date_debut' => $rendezVous->date_debut,
                'date_fin' => $rendezVous->date_fin,
                'motif' => $rendezVous->motif,
                'statut' => $rendezVous->statut,
                'notes' => $rendezVous->notes
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'medecin_id' => 'required|integer|exists:users,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'name' => 'required|string|max:255',
            'statut' => 'required'
        ]);

        // Chercher l'utilisateur par email
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $validated['client_id'] = $user->id;
        }

        // Ajouter automatiquement l'author_id (l'utilisateur connecté)
        $validated['author_id'] = auth()->user()->id;

        $rendezVous = RendezVous::create($validated);
        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'rendez_vous' => $rendezVous
        ], 201);
    }

    public function destroy($id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->delete();

        return response()->json([
            'message' => 'Rendez-vous supprimé avec succès'
        ], 200);
    }

}
