<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GestionnaireMedecin extends Model
{
    use HasFactory;

    protected $table = 'gestionnaire_medecin';

    protected $fillable = [
        'gestionnaire_id',
        'medecin_id',
        'statut',
        'message',
    ];

    /**
     * Relation avec le gestionnaire
     */
    public function gestionnaire()
    {
        return $this->belongsTo(User::class, 'gestionnaire_id');
    }

    /**
     * Relation avec le médecin
     */
    public function medecin()
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    /**
     * Scope pour les liaisons en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    /**
     * Scope pour les liaisons acceptées
     */
    public function scopeAcceptee($query)
    {
        return $query->where('statut', 'accepte');
    }

    /**
     * Scope pour les liaisons refusées
     */
    public function scopeRefusee($query)
    {
        return $query->where('statut', 'refuse');
    }
}
