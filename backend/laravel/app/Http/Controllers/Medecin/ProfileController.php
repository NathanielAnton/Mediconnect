<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\MedecinProfile;
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
            ]);
        }

        // Charger la relation spécialité pour inclure les données dans la réponse
        $profile->load('specialite');

        return response()->json($profile->only([
            'id',
            'user_id',
            'hopital_id',
            'specialite_id',
            'description',
            'adresse',
            'ville',
            'telephone',
            'created_at',
            'updated_at',
            'specialite_nom',
            'specialite_slug',
        ]));
    }

    /**
     * Mettre à jour le profil du médecin
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'specialite_id' => 'nullable|integer|exists:specialites,id',
            'description' => 'nullable|string',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
        ]);

        $profile = $user->medecinProfile;

        if (!$profile) {
            $profile = MedecinProfile::create([
                'user_id' => $user->id,
            ]);
        }

        $profile->update($validated);

        // Force refresh and reload relations
        $profile->refresh();
        $profile->load('specialite');



        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => $profile->only([
                'id',
                'user_id',
                'hopital_id',
                'specialite_id',
                'description',
                'adresse',
                'ville',
                'telephone',
                'created_at',
                'updated_at',
                'specialite_nom',
                'specialite_slug',
            ])
        ], 200);
    }
}
