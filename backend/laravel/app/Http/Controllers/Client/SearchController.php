<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MedecinProfile;
use App\Models\Specialite;

class SearchController extends Controller
{
    /**
     * Rechercher des médecins
     */
    public function searchMedecins(Request $request)
    {
        $search = $request->query('search', '');
        $specialite = $request->query('specialite', null);

        $query = MedecinProfile::with(['specialite', 'user'])
            ->where('statut', 'actif');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($specialite) {
            $query->where('specialite_id', $specialite);
        }

        $medecins = $query->get()
            ->map(function ($medecin) {
                return [
                    'id' => $medecin->id,
                    'user_id' => $medecin->user_id,
                    'name' => $medecin->user->name,
                    'email' => $medecin->user->email,
                    'specialite' => $medecin->specialite ? $medecin->specialite->name : null,
                    'adresse' => $medecin->adresse,
                    'telephone' => $medecin->telephone
                ];
            });

        return response()->json(['medecins' => $medecins]);
    }

    /**
     * Récupérer les spécialités
     */
    public function getSpecialites()
    {
        $specialites = Specialite::select('id', 'nom')->get();
        return response()->json(['specialites' => $specialites]);
    }
}
