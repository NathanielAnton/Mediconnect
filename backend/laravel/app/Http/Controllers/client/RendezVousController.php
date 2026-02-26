<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RendezVous;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class RendezVousController extends Controller
{
    /**
     * Client crée un rendez-vous
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medecin_id' => 'required|integer|exists:users,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'statut' => 'required',
            'client_id' => 'nullable|integer|exists:users,id',
        ]);

        // Chercher l'utilisateur par email
        $user = auth()->user();
        if (is_null($user)) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        $validated['email'] = $user->email;
        $validated['author_id'] = $user->id;

        $rendezVous = RendezVous::create($validated);
        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'rendez_vous' => $rendezVous
        ], 201);
    }

    /**
     * Client récupère ses rendez-vous
     */
    public function getMyRendezVous(Request $request)
    {
        $client = $request->user();

        $rendezVous = RendezVous::where('client_id', $client->id)
            ->orWhere('author_id', $client->id)
            ->with(['medecin'])
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
                    'notes' => $rdv->notes,
                    'medecin' => $rdv->medecin ? [
                        'id' => $rdv->medecin->id,
                        'name' => $rdv->medecin->name
                    ] : null
                ];
            });

        return response()->json([
            'rendez_vous' => $rendezVous
        ]);
    }

    /**
     * Client récupère les détails d'un rendez-vous
     */
    public function show(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        
        // Charger les relations
        $rendezVous->load(['medecin']);

        return response()->json([
            'rendezVous' => [
                'id' => $rendezVous->id,
                'name' => $rendezVous->name,
                'email' => $rendezVous->email,
                'date_debut' => $rendezVous->date_debut,
                'date_fin' => $rendezVous->date_fin,
                'motif' => $rendezVous->motif,
                'statut' => $rendezVous->statut,
                'notes' => $rendezVous->notes,
                'client_id' => $rendezVous->client_id,
                'medecin_id' => $rendezVous->medecin_id,
                'medecin' => $rendezVous->medecin ? [
                    'id' => $rendezVous->medecin->id,
                    'name' => $rendezVous->medecin->name,
                    'specialite' => $rendezVous->medecin->specialite,
                ] : null
            ]
        ]);
    }

    /**
     * Client annule son rendez-vous
     */
    public function cancel(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $client = $request->user();

        // Vérifier que le client est propriétaire du rendez-vous
        if ($rendezVous->client_id !== $client->id && $rendezVous->author_id !== $client->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rendezVous->update(['statut' => 'annulé']);

        return response()->json([
            'message' => 'Rendez-vous annulé avec succès',
            'rendez_vous' => $rendezVous
        ], 200);
    }
}
