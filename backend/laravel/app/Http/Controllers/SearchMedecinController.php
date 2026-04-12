<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hopital;
use App\Models\MedecinProfile;
use Illuminate\Http\Request;

class SearchMedecinController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->input('query', '');

            // ---- Médecins ----
            if (empty($query)) {
                $medecinProfiles = MedecinProfile::with('user', 'specialite', 'hopital')
                    ->limit(20)
                    ->get();
            } else {
                $medecinProfiles = MedecinProfile::with('user', 'specialite', 'hopital')
                    ->where(function ($q) use ($query) {
                        $q->where('ville', 'LIKE', "%{$query}%")
                            ->orWhereHas('user', function ($userQuery) use ($query) {
                                $userQuery->where('name', 'LIKE', "%{$query}%");
                            })
                            ->orWhereHas('specialite', function ($specQuery) use ($query) {
                                $specQuery->where('nom', 'LIKE', "%{$query}%");
                            });
                    })
                    ->limit(20)
                    ->get();
            }

            $medecins = $medecinProfiles->map(function ($profile) {
                return [
                    'type'            => 'medecin',
                    'id'              => $profile->user->id,
                    'medecin_id'      => $profile->id,
                    'name'            => $profile->user->name,
                    'email'           => $profile->user->email,
                    'specialite'      => $profile->specialite->nom ?? 'Non renseignée',
                    'ville'           => $profile->ville ?? 'Non renseignée',
                    'adresse'         => $profile->adresse ?? '',
                    'telephone'       => $profile->telephone ?? '',
                    'description'     => $profile->description ?? '',
                    'hopital_id'      => $profile->hopital_id,
                    'hopital_nom'     => $profile->hopital ? $profile->hopital->name : null,
                    'hopital_adresse' => $profile->hopital ? $profile->hopital->adresse : null,
                    'hopital_ville'   => $profile->hopital ? $profile->hopital->ville : null,
                ];
            });

            // ---- Hôpitaux ----
            if (empty($query)) {
                $hopitalModels = Hopital::withCount('medecins')->limit(10)->get();
            } else {
                $hopitalModels = Hopital::withCount('medecins')
                    ->where(function ($q) use ($query) {
                        $q->where('name', 'LIKE', "%{$query}%")
                            ->orWhere('ville', 'LIKE', "%{$query}%")
                            ->orWhere('description', 'LIKE', "%{$query}%")
                            ->orWhereHas('medecins.specialite', function ($specQuery) use ($query) {
                                $specQuery->where('nom', 'LIKE', "%{$query}%");
                            });
                    })
                    ->limit(10)
                    ->get();
            }

            $hopitaux = $hopitalModels->map(function ($hopital) {
                return [
                    'type'           => 'hopital',
                    'id'             => $hopital->id,
                    'name'           => $hopital->name,
                    'ville'          => $hopital->ville,
                    'telephone'      => $hopital->telephone,
                    'email'          => $hopital->email ?? '',
                    'description'    => $hopital->description ?? '',
                    'medecins_count' => $hopital->medecins_count,
                ];
            });

            $results = $medecins->concat($hopitaux)->values();

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur lors de la recherche',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getHopitalMedecins($id)
    {
        try {
            $hopital = Hopital::findOrFail($id);

            $profiles = MedecinProfile::with('user', 'specialite')
                ->where('hopital_id', $hopital->id)
                ->get();

            // Grouper par spécialité
            $grouped = $profiles->groupBy(function ($profile) {
                return $profile->specialite->nom ?? 'Non renseignée';
            });

            $medecinsParSpecialite = $grouped->map(function ($items, $specialite) use ($hopital) {
                return [
                    'specialite' => $specialite,
                    'medecins'   => $items->map(function ($profile) use ($hopital) {
                        return [
                            'id'          => $profile->user->id,
                            'medecin_id'  => $profile->id,
                            'name'        => $profile->user->name,
                            'specialite'  => $profile->specialite->nom ?? 'Non renseignée',
                            'telephone'   => $profile->telephone ?? '',
                            'adresse'     => $profile->adresse ?? '',
                            'description' => $profile->description ?? '',
                            'hopital_id'  => $hopital->id,
                        ];
                    })->values(),
                ];
            })->values();

            return response()->json([
                'hopital' => [
                    'id'          => $hopital->id,
                    'name'        => $hopital->name,
                    'adresse'     => $hopital->adresse,
                    'ville'       => $hopital->ville,
                    'telephone'   => $hopital->telephone,
                    'email'       => $hopital->email ?? '',
                    'description' => $hopital->description ?? '',
                ],
                'medecins_par_specialite' => $medecinsParSpecialite,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur lors du chargement',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
