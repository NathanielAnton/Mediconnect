<?php

namespace App\Http\Controllers;

use App\Models\MedecinProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\MedecinPlanningController;

class MedecinProfileController extends Controller
{
    // Récupérer le profil du médecin connecté
    public function show()
    {
        $user = Auth::user();

        if (!$user->isMedecin()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $profile = $user->medecinProfile;

        if (!$profile) {
            // Si le profil n'existe pas encore, on en créé un vide
            $profile = MedecinProfile::create([
                'user_id' => $user->id,
                'specialite_id' => null,
                'description' => '',
                'adresse' => '',
                'ville' => '',
                'telephone' => '',
                'horaires' => [],
            ]);
        }

        // Charger la relation spécialité pour inclure les données dans la réponse
        $profile->load('specialite');

        return response()->json($profile);
    }

    // Mettre à jour le profil
    public function update(Request $request)
    {
        $user = Auth::user();

        if (!$user->isMedecin()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'specialite_id' => 'nullable|int',
            'description' => 'nullable|string',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'horaires' => 'nullable|array',
        ]);

        $profile = $user->medecinProfile ?? new MedecinProfile(['user_id' => $user->id]);
        $profile->fill($validated);
        $profile->save();

        MedecinPlanningController::setHorairesDefaut($profile->id);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => $profile,
        ]);
    }
}
