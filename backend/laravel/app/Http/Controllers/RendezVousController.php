<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RendezVous;

class RendezVousController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medecin_id' => 'required|integer|exists:users,id',
            'client_id' => 'required|integer|exists:users,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'statut' => 'required'
        ]);

        $rendezVous = RendezVous::create($validated);
        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'rendez_vous' => $rendezVous
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $rendezVous = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'motif' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'statut' => 'required|string'
        ]);

        $rendezVous->update($validated);

        return response()->json([
            'message' => 'Rendez-vous mis à jour avec succès',
            'rendez_vous' => $rendezVous
        ], 200);
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
