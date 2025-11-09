<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class SearchMedecinController extends Controller
{
    public function search(Request $request)
    {
        return [
            'id' => 1,
            'name' => 'Dr. John Doe',
            'email' => 'john.doe@example.com',
            'specialite' => 'Cardiologie',
            'ville' => 'Paris',
            'adresse' => '123 Rue de la Santé',
            'telephone' => '0123456789',
            'description' => 'Médecin spécialisé en cardiologie avec 10 ans d\'expérience.'

        ];

        try {
            $query = $request->input('query', '');
            
            if (empty($query)) {
                return response()->json([]);
            }

            $medecins = User::whereHas('roles', function($q) {
                    $q->where('name', 'medecin');
                })
                ->with(['medecinProfile.specialite'])
                ->where(function($q) use ($query) {
                    // Recherche par nom d'utilisateur
                    $q->where('name', 'LIKE', "%{$query}%")
                      // Ou par ville du profil
                      ->orWhereHas('medecinProfile', function($profileQuery) use ($query) {
                          $profileQuery->where('ville', 'LIKE', "%{$query}%");
                      });
                })
                ->limit(20)
                ->get()
                ->map(function($user) {
                    $profile = $user->medecinProfile;
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'specialite' => $profile?->specialite?->nom ?? 'Non renseignée',
                        'ville' => $profile?->ville ?? 'Non renseignée',
                        'adresse' => $profile?->adresse ?? '',
                        'telephone' => $profile?->telephone ?? '',
                        'description' => $profile?->description ?? '',
                    ];
                });

            return response()->json($medecins);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la recherche',
                'message' => $e->getMessage()
            ], 500);
        }
    }


}