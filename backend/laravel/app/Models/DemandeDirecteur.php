<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeDirecteur extends Model
{
    use HasFactory;

    protected $table = 'demandes_directeur';

    protected $fillable = [
        'name',
        'email',
        'password',
        'hopital_name',
        'hopital_adresse',
        'hopital_telephone',
        'hopital_ville',
        'statut',
        'commentaire_admin'
    ];

    protected $hidden = [
        'password',
    ];
}
