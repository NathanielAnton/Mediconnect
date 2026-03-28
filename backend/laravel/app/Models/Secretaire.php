<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secretaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hopital_id',
        'name',
    ];

    /**
     * Relation avec le modèle User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'hôpital
     */
    public function hopital()
    {
        return $this->belongsTo(Hopital::class);
    }
}
