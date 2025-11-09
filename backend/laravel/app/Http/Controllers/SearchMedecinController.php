<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MedecinProfile;
use Illuminate\Http\Request;

class SearchMedecinController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->input('query', '');
            
            // Si pas de recherche, retourner tous les médecins
            if (empty($query)) {
                $medecins = MedecinProfile::with('user', 'specialite')
                    ->limit(20)
                    ->get();
            } else {
                // Recherche avec filtres
                $medecins = MedecinProfile::with('user', 'specialite')
                    ->where(function($q) use ($query) {
                        // Recherche par ville
                        $q->where('ville', 'LIKE', "%{$query}%")
                          // Ou par nom d'utilisateur
                          ->orWhereHas('user', function($userQuery) use ($query) {
                              $userQuery->where('name', 'LIKE', "%{$query}%");
                          })
                          // Ou par spécialité
                          ->orWhereHas('specialite', function($specQuery) use ($query) {
                              $specQuery->where('nom', 'LIKE', "%{$query}%");
                          });
                    })
                    ->limit(20)
                    ->get();
            }

            // Formatter les résultats
            $medecins = $medecins->map(function ($profile) {
                return [
                    'id' => $profile->user->id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'specialite' => $profile->specialite->nom ?? 'Non renseignée',
                    'ville' => $profile->ville ?? 'Non renseignée',
                    'adresse' => $profile->adresse ?? '',
                    'telephone' => $profile->telephone ?? '',
                    'description' => $profile->description ?? '',
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