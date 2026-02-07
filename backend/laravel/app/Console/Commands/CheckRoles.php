<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class CheckRoles extends Command
{
    protected $signature = 'roles:check';
    protected $description = 'Afficher tous les rôles et les utilisateurs assignés';

    public function handle()
    {
        $this->info('=== RÔLES EXISTANTS ===');
        $roles = Role::all();

        if ($roles->isEmpty()) {
            $this->warn('Aucun rôle trouvé dans la base de données.');
            $this->info("\nPour créer des rôles, exécutez :");
            $this->line("php artisan tinker");
            $this->line(">>> use Spatie\Permission\Models\Role;");
            $this->line(">>> Role::create(['name' => 'gestionnaire']);");
            return;
        }

        foreach ($roles as $role) {
            $this->line("\n📌 Rôle: {$role->name} (ID: {$role->id})");

            $users = User::role($role->name)->get();

            if ($users->isEmpty()) {
                $this->comment("   Aucun utilisateur avec ce rôle");
            } else {
                foreach ($users as $user) {
                    $this->info("   ✓ {$user->name} ({$user->email})");
                }
            }
        }

        $this->info("\n=== UTILISATEURS SANS RÔLE ===");
        $usersWithoutRoles = User::doesntHave('roles')->get();

        if ($usersWithoutRoles->isEmpty()) {
            $this->info('Tous les utilisateurs ont un rôle assigné.');
        } else {
            foreach ($usersWithoutRoles as $user) {
                $this->warn("   ⚠ {$user->name} ({$user->email}) - Aucun rôle");
            }
        }

        $this->info("\n=== CONTENU TABLE model_has_roles ===");
        $modelHasRoles = \DB::table('model_has_roles')->get();

        if ($modelHasRoles->isEmpty()) {
            $this->warn('La table model_has_roles est vide.');
        } else {
            $this->table(
                ['Role ID', 'Model Type', 'Model ID (User ID)'],
                $modelHasRoles->map(function ($row) {
                    return [
                        $row->role_id,
                        $row->model_type,
                        $row->model_id
                    ];
                })
            );
        }

        $this->newLine();
        $this->info('Pour assigner un rôle à un utilisateur :');
        $this->line('php artisan user:assign-role email@example.com nom_du_role');
    }
}
