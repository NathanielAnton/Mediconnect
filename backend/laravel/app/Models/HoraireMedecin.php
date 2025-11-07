<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HoraireMedecin extends Model
{
    use HasFactory;

    protected $table = 'horaires_medecins';

    protected $fillable = [
        'medecin_id',
        'jour',
        'creneau',
        'heure_debut',
        'heure_fin',
        'actif'
    ];

    protected $casts = [
        'actif' => 'boolean',
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function medecin()
    {
        return $this->belongsTo(MedecinProfile::class, 'medecin_id');
    }

    public function getCreneauLibelleAttribute()
    {
        return $this->creneau === 'matin' ? 'Matin' : 'Après-midi';
    }

    public function getHeuresFormateesAttribute()
    {
        return $this->heure_debut->format('H:i') . ' - ' . $this->heure_fin->format('H:i');
    }
}