<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialite extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'slug',
        'description'
    ];

    // Relation avec les profils médecins
    public function medecinProfiles()
    {
        return $this->hasMany(MedecinProfile::class);
    }
}