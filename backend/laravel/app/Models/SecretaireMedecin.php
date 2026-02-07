<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecretaireMedecin extends Model
{
    use HasFactory;

    protected $table = 'secretaire_medecin';

    protected $fillable = [
        'secretaire_id',
        'medecin_id',
        'statut',
        'message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relation avec le secrétaire (User)
    public function secretaire()
    {
        return $this->belongsTo(User::class, 'secretaire_id');
    }

    // Relation avec le médecin (User)
    public function medecin()
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    // Scopes pour faciliter les requêtes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeAcceptee($query)
    {
        return $query->where('statut', 'accepte');
    }

    public function scopeRefusee($query)
    {
        return $query->where('statut', 'refuse');
    }
}
