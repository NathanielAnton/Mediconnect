<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:assign-role {email} {role}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assigner un rôle à un utilisateur';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $roleName = $this->argument('role');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Utilisateur avec l'email {$email} introuvable.");
            return 1;
        }

        // Créer le rôle s'il n'existe pas
        $role = Role::firstOrCreate(['name' => $roleName]);

        // Retirer tous les anciens rôles et assigner le nouveau
        $user->syncRoles([$roleName]);

        $this->info("Le rôle '{$roleName}' a été assigné à {$user->name} ({$email}).");
        return 0;
    }
}
