<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secretaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hopital_id',
        'name',
    ];

    /**
     * Relation avec le modèle User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'hôpital
     */
    public function hopital()
    {
        return $this->belongsTo(Hopital::class);
    }

    /**
     * Relation: médecins liés via secretaire_medecin
     */
    public function medecinsLies()
    {
        return $this->belongsToMany(
            User::class,
            'secretaire_medecin',
            'secretaire_id',
            'medecin_id'
        )
            ->where('secretaire_medecin.statut', 'accepte')
            ->with(['medecinProfile.specialite']);
    }

    /**
     * Relation: médecins de l'hôpital
     */
    public function medecinsHopital()
    {
        return User::role('medecin')
            ->whereHas('medecinProfile', function ($query) {
                $query->where('hopital_id', $this->hopital_id);
            })
            ->with(['medecinProfile.specialite']);
    }

    /**
     * Récupère les médecins accessibles selon le contexte
     * Si hopital_id: retourne tous les médecins de l'hôpital
     * Sinon: retourne les médecins liés via secretaire_medecin
     */
    public function getMedecinsAccessibles()
    {
        if ($this->hopital_id) {
            return $this->medecinsHopital();
        }

        return $this->medecinsLies();
    }

    /**
     * Récupère les IDs des profils médecins accessibles
     */
    public function getMedecinProfileIds()
    {
        if ($this->hopital_id) {
            return MedecinProfile::where('hopital_id', $this->hopital_id)
                ->pluck('id')
                ->toArray();
        }

        return $this->medecinsLies()
            ->with('medecinProfile')
            ->get()
            ->pluck('medecinProfile.id')
            ->toArray();
    }
}
