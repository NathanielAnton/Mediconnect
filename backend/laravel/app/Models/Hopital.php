<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hopital extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'adresse',
        'telephone',
        'ville',
    ];

    /**
     * Relation avec les directeurs
     */
    public function directeurs()
    {
        return $this->hasMany(Directeur::class);
    }

    /**
     * Relation avec les médecins
     */
    public function medecins()
    {
        return $this->hasMany(MedecinProfile::class);
    }

    /**
     * Relation avec les gestionnaires
     */
    public function gestionnaires()
    {
        return $this->hasMany(Gestionnaire::class);
    }

    /**
     * Relation avec les secrétaires
     */
    public function secretaires()
    {
        return $this->hasMany(Secretaire::class);
    }

    public function users()
    {
        return $this->hasManyThrough(User::class, Directeur::class, 'hopital_id', 'id', 'id', 'user_id')
            ->union($this->hasManyThrough(User::class, Gestionnaire::class, 'hopital_id', 'id', 'id', 'user_id'))
            ->union($this->hasManyThrough(User::class, Secretaire::class, 'hopital_id', 'id', 'id', 'user_id'))
            ->union($this->hasManyThrough(User::class, MedecinProfile::class, 'hopital_id', 'id', 'id', 'user_id'));
    }
}
