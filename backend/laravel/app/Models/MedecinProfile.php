<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedecinProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialite',
        'description',
        'adresse',
        'ville',
        'telephone',
        'horaires',
    ];

    protected $casts = [
        'horaires' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
