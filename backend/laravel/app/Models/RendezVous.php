<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    use HasFactory;

    protected $table = 'rendez_vous';

    protected $fillable = [
        'medecin_id',
        'client_id',
        'date_debut',
        'date_fin',
        'statut',
        'motif',
        'notes'
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    public function medecin()
    {
        return $this->belongsTo(MedecinProfile::class, 'medecin_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}