<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\MedecinPlanningController;

class ProfileController extends Controller
{
    /**
     * Récupérer le profil du médecin
     */
    public function show()
    {
        $user = Auth::user();

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

    /**
     * Mettre à jour le profil du médecin
     */
    public function update(Request $request)
    {
        $medecin = $request->user();
        $profile = $medecin->medecinProfile;

        $validated = $request->validate([
            'adresse' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:20',
            'bio' => 'sometimes|nullable|string|max:1000'
        ]);

        $profile->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'name' => $medecin->name,
                'email' => $medecin->email,
                'specialite_id' => $profile->specialite_id,
                'adresse' => $profile->adresse,
                'telephone' => $profile->telephone,
                'bio' => $profile->bio
            ]
        ]);
    }
}
