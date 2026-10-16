<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Hopital;
use App\Models\MedecinProfile;
use App\Models\User;
use Illuminate\Http\Request;

class HopitalController extends Controller
{
    /**
     * SuperAdmin récupère tous les établissements
     */
    public function getAll()
    {
        $hopitaux = Hopital::withCount('medecins')
            ->orderBy('name')
            ->get()
            ->map(function ($hopital) {
                return [
                    'id' => $hopital->id,
                    'name' => $hopital->name,
                    'ville' => $hopital->ville,
                    'adresse' => $hopital->adresse,
                    'telephone' => $hopital->telephone,
                    'email' => $hopital->email,
                    'medecins_count' => $hopital->medecins_count,
                    'hide' => $hopital->hide,
                    'created_at' => $hopital->created_at,
                ];
            });

        return response()->json([
            'hopitaux' => $hopitaux,
            'total' => $hopitaux->count(),
        ]);
    }

    /**
     * SuperAdmin masque/réaffiche un établissement des pages publiques.
     * Masquer un établissement masque en cascade tous ses médecins.
     * Le réaffichage de l'établissement ne réaffiche PAS automatiquement ses médecins :
     * le superadmin doit les réafficher individuellement ou via unhideAllMedecins().
     */
    public function toggleHide(Request $request, $id)
    {
        $request->validate([
            'hide' => 'required|boolean',
        ]);

        $hopital = Hopital::findOrFail($id);
        $hide = $request->boolean('hide');
        $hopital->update(['hide' => $hide]);

        if ($hide) {
            $userIds = MedecinProfile::where('hopital_id', $hopital->id)->pluck('user_id');
            User::whereIn('id', $userIds)->update(['hide' => true]);
        }

        return response()->json([
            'message' => $hopital->hide
                ? 'Établissement masqué avec succès'
                : 'Établissement réaffiché avec succès',
            'hopital' => [
                'id' => $hopital->id,
                'hide' => $hopital->hide,
            ],
        ]);
    }

    /**
     * Liste des médecins d'un établissement avec leur statut hide,
     * pour permettre au superadmin de les réafficher individuellement.
     */
    public function medecins($id)
    {
        $hopital = Hopital::findOrFail($id);

        $medecins = MedecinProfile::with('user', 'specialite')
            ->where('hopital_id', $hopital->id)
            ->get()
            ->filter(fn ($profile) => $profile->user)
            ->map(function ($profile) {
                return [
                    'id' => $profile->user->id,
                    'medecin_id' => $profile->id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'specialite' => $profile->specialite->nom ?? 'Non renseignée',
                    'hide' => $profile->user->hide,
                ];
            })
            ->values();

        return response()->json([
            'hopital' => [
                'id' => $hopital->id,
                'name' => $hopital->name,
                'hide' => $hopital->hide,
            ],
            'medecins' => $medecins,
        ]);
    }

    /**
     * Réaffiche en une seule action tous les médecins d'un établissement.
     */
    public function unhideAllMedecins($id)
    {
        $hopital = Hopital::findOrFail($id);

        $userIds = MedecinProfile::where('hopital_id', $hopital->id)->pluck('user_id');
        User::whereIn('id', $userIds)->update(['hide' => false]);

        return response()->json([
            'message' => 'Tous les médecins de cet établissement ont été réaffichés',
        ]);
    }
}
