<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedecinProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialite_id',
        'description',
        'adresse',
        'ville',
        'telephone',
        'horaires',
    ];

    protected $casts = [
        'horaires' => 'array',
    ];

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation avec la spécialité
    public function specialite()
    {
        return $this->belongsTo(Specialite::class);
    }

    // Helper pour obtenir le nom de la spécialité
    public function getSpecialiteNomAttribute()
    {
        return $this->specialite ? $this->specialite->nom : null;
    }

    // Accesseur pour le slug de la spécialité
    public function getSpecialiteSlugAttribute()
    {
        return $this->specialite ? $this->specialite->slug : null;
    }

    // Ajouter les accesseurs à l'array du modèle
    protected $appends = ['specialite_nom', 'specialite_slug'];
}