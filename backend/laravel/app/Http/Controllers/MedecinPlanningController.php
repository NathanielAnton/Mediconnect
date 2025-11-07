<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HoraireMedecin;
use App\Models\IndisponibiliteMedecin;
use App\Models\RendezVous;
use Illuminate\Support\Facades\Auth;

class MedecinPlanningController extends Controller
{
    /**
     * 🗓️ Récupérer le planning complet du médecin connecté
     */
    public function getPlanning()
    {
        $medecinId = Auth::id();

        $horaires = HoraireMedecin::where('medecin_id', $medecinId)->get();
        $indispos = IndisponibiliteMedecin::where('medecin_id', $medecinId)->get();
        $rdvs = RendezVous::where('medecin_id', $medecinId)
            ->with('client:id,name,email')
            ->get();

        return response()->json([
            'horaires' => $horaires,
            'indisponibilites' => $indispos,
            'rendez_vous' => $rdvs,
        ]);
    }

    /**
     * Set les horaires réguliers
     */
    public static function setHorairesDefaut($medecinId)
    {
        // Vérifier si des horaires existent déjà
        $existingHoraires = HoraireMedecin::where('medecin_id', $medecinId)->count();
        if ($existingHoraires > 0) {
            return null;
        }

        // Liste des jours ouvrés
        $jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

        $horairesCrees = [];

        foreach ($jours as $jour) {
            // Créneau du matin
            $horaireMatin = HoraireMedecin::create([
                'medecin_id' => $medecinId,
                'jour' => $jour,
                'creneau' => 'matin',
                'heure_debut' => '08:30',
                'heure_fin' => '12:30',
                'actif' => true,
            ]);
            $horairesCrees[] = $horaireMatin;

            // Créneau de l'après-midi
            $horaireApresMidi = HoraireMedecin::create([
                'medecin_id' => $medecinId,
                'jour' => $jour,
                'creneau' => 'apres_midi',
                'heure_debut' => '13:30',
                'heure_fin' => '17:00',
                'actif' => true,
            ]);
            $horairesCrees[] = $horaireApresMidi;
        }

        return $horairesCrees;
    }

    /**
     * 🕓 Mettre à jour ou créer les horaires réguliers
     */
    public function updateHoraire(Request $request)
    {
        $validated = $request->validate([
            'jour' => 'required|string',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
        ]);

        $horaire = HoraireMedecin::updateOrCreate(
            [
                'medecin_id' => Auth::id(),
                'jour' => $validated['jour'],
            ],
            [
                'heure_debut' => $validated['heure_debut'],
                'heure_fin' => $validated['heure_fin'],
                'actif' => true,
            ]
        );

        return response()->json(['message' => 'Horaire mis à jour', 'data' => $horaire]);
    }

    /**
     * 🚫 Ajouter une indisponibilité
     */
    public function addIndisponibilite(Request $request)
    {
        $validated = $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'motif' => 'nullable|string|max:255',
        ]);

        $indispo = IndisponibiliteMedecin::create([
            'medecin_id' => Auth::id(),
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'motif' => $validated['motif'],
        ]);

        return response()->json(['message' => 'Indisponibilité ajoutée', 'data' => $indispo]);
    }

    /**
     * 🗑️ Supprimer une indisponibilité
     */
    public function deleteIndisponibilite($id)
    {
        $indispo = IndisponibiliteMedecin::where('medecin_id', Auth::id())->findOrFail($id);
        $indispo->delete();

        return response()->json(['message' => 'Indisponibilité supprimée']);
    }
}
