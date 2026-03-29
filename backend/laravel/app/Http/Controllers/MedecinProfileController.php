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

        $profile = $user->medecinProfile;

        if (!$profile) {
            // Si le profil n'existe pas encore, on en créé un vide
            $profile = MedecinProfile::create([
                'user_id' => $user->id,
            ]);
        }

        // Charger la relation spécialité pour inclure les données dans la réponse
        $profile->load('specialite');

        // Retourner seulement les champs du profil
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

    // Mettre à jour le profil
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'specialite_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'horaires' => 'nullable|array',
        ]);

        // Récupérer ou créer le profil
        $profile = $user->medecinProfile;
        if (!$profile) {
            $profile = MedecinProfile::create([
                'user_id' => $user->id,
            ]);
        }

        // Mettre à jour le profil avec les données validées
        $profile->update($validated);

        // Forcer un refresh depuis la base de données
        $profile->refresh();

        // Charger la relation specialite
        $profile->load('specialite');

        // Définir les horaires par défaut si spécialité changée
        if ($request->has('specialite_id')) {
            MedecinPlanningController::setHorairesDefaut($profile->id);
        }

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
            ]),
        ], 200);
    }
}
