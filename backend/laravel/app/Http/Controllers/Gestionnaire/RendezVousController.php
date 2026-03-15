<?php

namespace App\Http\Controllers\Gestionnaire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RendezVous;

class RendezVousController extends Controller
{
    /**
     * Gestionnaire récupère tous les rendez-vous
     */
    public function getAll(Request $request)
    {
        $rendezVous = RendezVous::with(['medecin', 'client'])
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
                        'name' => $rdv->medecin->user->name ?? null
                    ] : null
                ];
            });

        return response()->json([
            'rendez_vous' => $rendezVous,
            'total' => count($rendezVous)
        ]);
    }

    /**
     * Gestionnaire récupère un rendez-vous spécifique
     */
    public function show($id)
    {
        $rendezVous = RendezVous::with(['medecin', 'client'])->findOrFail($id);

        return response()->json([
            'rendez_vous' => [
                'id' => $rendezVous->id,
                'name' => $rendezVous->name,
                'email' => $rendezVous->email,
                'date_debut' => $rendezVous->date_debut,
                'date_fin' => $rendezVous->date_fin,
                'motif' => $rendezVous->motif,
                'statut' => $rendezVous->statut,
                'notes' => $rendezVous->notes,
                'medecin' => $rendezVous->medecin ? [
                    'id' => $rendezVous->medecin->id,
                    'name' => $rendezVous->medecin->user->name ?? null
                ] : null,
                'client' => $rendezVous->client ? [
                    'id' => $rendezVous->client->id,
                    'name' => $rendezVous->client->name
                ] : null
            ]
        ]);
    }

    /**
     * Gestionnaire met à jour un rendez-vous
     */
    public function update(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'motif' => 'sometimes|nullable|string|max:500',
            'notes' => 'sometimes|nullable|string|max:1000',
            'statut' => 'sometimes|string'
        ]);

        $rendezVous->update($validated);

        return response()->json([
            'message' => 'Rendez-vous mis à jour avec succès',
            'rendez_vous' => $rendezVous
        ]);
    }

    /**
     * Gestionnaire supprime un rendez-vous
     */
    public function delete($id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->delete();

        return response()->json([
            'message' => 'Rendez-vous supprimé avec succès'
        ]);
    }
}
