<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeGestionnaire extends Model
{
    use HasFactory;

    protected $table = 'demandes_gestionnaire';

    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'etablissement',
        'statut',
        'commentaire_admin'
    ];

    protected $hidden = [
        'password',
    ];
}
