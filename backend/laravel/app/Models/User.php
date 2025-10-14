<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Méthodes helper pour vérifier les rôles
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isMedecin()
    {
        return $this->hasRole('medecin');
    }

    public function isClient()
    {
        return $this->hasRole('client');
    }

    // Méthode pour obtenir le rôle principal
    public function getMainRoleAttribute()
    {
        return $this->roles->first()->name ?? 'client';
    }

    public function medecinProfile()
    {
        return $this->hasOne(MedecinProfile::class);
    }
}