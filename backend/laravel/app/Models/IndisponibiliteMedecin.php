<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndisponibiliteMedecin extends Model
{
    use HasFactory;

    protected $table = 'indisponibilites_medecins';

    protected $fillable = [
        'medecin_id',
        'date_debut',
        'date_fin',
        'motif'
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function medecin()
    {
        return $this->belongsTo(MedecinProfile::class, 'medecin_id');
    }
}
