<?php

namespace App\Http\Controllers\Medecin;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class PdfDataController extends Controller
{
    public function show(Request $request, int $rendezVousId)
    {
        $profile = $request->user()->medecinProfile;
        abort_unless($profile, 403);

        $rdv = RendezVous::with('client')
            ->where('medecin_id', $profile->id)
            ->findOrFail($rendezVousId);

        $profile->load(['user', 'hopital', 'specialite']);

        return response()->json([
            'medecin' => [
                'nom' => $profile->user?->name,
                'specialite' => $profile->specialite_nom,
                'hopital' => $profile->hopital?->name,
                'adresse' => $profile->adresse,
                'ville' => $profile->ville,
                'telephone' => $profile->telephone,
            ],
            'patient' => [
                'nom' => $rdv->client?->name ?? $rdv->name,
                'email' => $rdv->client?->email ?? $rdv->email,
                'telephone' => $rdv->client?->phone ?? $rdv->phone,
            ],
            'rendez_vous' => [
                'id' => $rdv->id,
                'date' => $rdv->date_debut->format('d/m/Y'),
                'heure' => $rdv->date_debut->format('H:i'),
                'motif' => $rdv->motif,
            ],
            'date_jour' => now()->format('d/m/Y'),
        ]);
    }
}
