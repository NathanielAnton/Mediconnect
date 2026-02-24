<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HoraireMedecin;
use App\Models\IndisponibiliteMedecin;
use App\Models\MedecinProfile;
use App\Models\RendezVous;
use Illuminate\Support\Facades\Auth;

class MedecinPlanningController extends Controller
{
    /**
     * 🗓️ Récupérer le planning complet du médecin connecté
     */
    public function getPlanning()
    {
        $medecinId = MedecinProfile::where('user_id', Auth::id())->first()->id;

        $horaires = HoraireMedecin::where('medecin_id', $medecinId)->get();
        $indispos = IndisponibiliteMedecin::where('medecin_id', $medecinId)->get();
        $rdvs = RendezVous::where('medecin_id', $medecinId)
            ->with([
                'medecin.user:id,name',
                'client:id,name,email'
            ])
            ->get();

        return response()->json([
            'manager_id' => $medecinId,
            'horaires' => $horaires,
            'indisponibilites' => $indispos,
            'rendez_vous' => $rdvs,
        ]);
    }

    /**
     * 🗓️ Récupérer le planning complet d'un medecin en fonction de son id
     */
    public function getPlanningById($medecinId)
    {
        // $medecinId = MedecinProfile::where('user_id', $id)->first()->id;
        $horaires = HoraireMedecin::where('medecin_id', $medecinId)->get();
        $indispos = IndisponibiliteMedecin::where('medecin_id', $medecinId)->get();
        $rdvs = RendezVous::where('medecin_id', $medecinId)
            ->with([
                'medecin.user:id,name',
                'client:id,name,email'
            ])
            ->get();

        return response()->json([
            'manager_id' => $medecinId,
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
        $jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'd'];

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
     * 🕓 Mettre à jour ou créer les horaires réguliers avec créneaux
     */
    public function updateHoraires(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'horaires' => 'required|array',
            'horaires.*.jour' => 'required|string|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'horaires.*.creneau' => 'required|string|in:matin,apres_midi',
            'horaires.*.heure_debut' => 'required|date_format:H:i',
            'horaires.*.heure_fin' => 'required|date_format:H:i|after:horaires.*.heure_debut',
            'horaires.*.actif' => 'sometimes|boolean',
        ]);

        $medecinId = $user->medecinProfile->id;
        $horairesMisAJour = [];

        foreach ($validated['horaires'] as $horaireData) {
            $horaire = HoraireMedecin::updateOrCreate(
                [
                    'medecin_id' => $medecinId,
                    'jour' => $horaireData['jour'],
                    'creneau' => $horaireData['creneau'],
                ],
                [
                    'heure_debut' => $horaireData['heure_debut'],
                    'heure_fin' => $horaireData['heure_fin'],
                    'actif' => $horaireData['actif'] ?? true,
                ]
            );

            $horairesMisAJour[] = $horaire;
        }

        // Charger les relations pour la réponse
        $horairesAvecRelations = HoraireMedecin::where('medecin_id', $medecinId)
            ->with('medecin')
            ->get();

        return response()->json([
            'message' => 'Horaires mis à jour avec succès',
            'count' => count($horairesMisAJour),
            'horaires' => $horairesAvecRelations
        ]);
    }

    /**
     * 📅 Récupérer tous les horaires du médecin
     */
    public function getHoraires()
    {
        $user = Auth::user();

        $medecinId = $user->medecinProfile->id;

        $horaires = HoraireMedecin::where('medecin_id', $medecinId)
            ->orderByRaw("FIELD(jour, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')")
            ->orderBy('creneau')
            ->get();

        return response()->json($horaires);
    }

    /**
     * 🔄 Activer/désactiver un créneau horaire
     */
    public function toggleHoraire(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'jour' => 'required|string|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'creneau' => 'required|string|in:matin,apres_midi',
            'actif' => 'required|boolean',
        ]);

        $medecinId = $user->medecinProfile->id;

        $horaire = HoraireMedecin::where('medecin_id', $medecinId)
            ->where('jour', $validated['jour'])
            ->where('creneau', $validated['creneau'])
            ->first();

        if (!$horaire) {
            return response()->json(['message' => 'Horaire non trouvé'], 404);
        }

        $horaire->update(['actif' => $validated['actif']]);

        return response()->json([
            'message' => $validated['actif'] ? 'Créneau activé' : 'Créneau désactivé',
            'horaire' => $horaire
        ]);
    }

    /**
     * 🗑️ Supprimer un créneau horaire
     */
    public function deleteHoraire(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'jour' => 'required|string|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'creneau' => 'required|string|in:matin,apres_midi',
        ]);

        $medecinId = $user->medecinProfile->id;

        $deleted = HoraireMedecin::where('medecin_id', $medecinId)
            ->where('jour', $validated['jour'])
            ->where('creneau', $validated['creneau'])
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Horaire supprimé avec succès']);
        }

        return response()->json(['message' => 'Horaire non trouvé'], 404);
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

        $medecinId = MedecinProfile::where('user_id', Auth::id())->value('id');

        if (!$medecinId) {
            return response()->json(['message' => 'Profil médecin introuvable'], 403);
        }

        // Vérifier s'il y a des chevauchements avec les indisponibilités existantes
        $dateDebut = $validated['date_debut'];
        $dateFin = $validated['date_fin'];

        $chevauchement = IndisponibiliteMedecin::where('medecin_id', $medecinId)
            ->where('date_debut', '<=', $dateFin)
            ->where('date_fin', '>=', $dateDebut)
            ->exists();

        if ($chevauchement) {
            return response()->json([
                'message' => 'Cette période chevauche avec une indisponibilité existante. Veuillez choisir une autre période.'
            ], 422);
        }

        $indispo = IndisponibiliteMedecin::create([
            'medecin_id' => $medecinId,
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
        $medecinId = MedecinProfile::where('user_id', Auth::id())->value('id');

        if (!$medecinId) {
            return response()->json(['message' => 'Profil médecin introuvable'], 403);
        }

        $indispo = IndisponibiliteMedecin::where('medecin_id', $medecinId)->findOrFail($id);
        $indispo->delete();

        return response()->json(['message' => 'Indisponibilité supprimée']);
    }
}
