<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MedecinProfile;
use App\Models\Specialite;
use App\Models\SecretaireMedecin;
use App\Models\GestionnaireMedecin;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin (ID 1)
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@mediconnect.com'],
            [
                'id' => 1,
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }
        $this->command->info('✓ Super Admin: admin@mediconnect.com');

        // 2. Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin.principal@mediconnect.com'],
            [
                'name' => 'Admin Principal',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
        $this->command->info('✓ Admin: admin.principal@mediconnect.com');

        // 3. Gestionnaire
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire@mediconnect.com'],
            [
                'name' => 'Gestionnaire Test',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$gestionnaire->hasRole('gestionnaire')) {
            $gestionnaire->assignRole('gestionnaire');
        }
        $this->command->info('✓ Gestionnaire: gestionnaire@mediconnect.com');

        // 4. Secrétaire
        $secretaire = User::firstOrCreate(
            ['email' => 'secretaire@mediconnect.com'],
            [
                'name' => 'Secrétaire Médicale',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$secretaire->hasRole('secretaire')) {
            $secretaire->assignRole('secretaire');
        }
        $this->command->info('✓ Secrétaire: secretaire@mediconnect.com');

        // 5. Médecins (3 exemples avec différentes spécialités)
        $specialites = Specialite::all();

        if ($specialites->count() >= 3) {
            // Médecin 1 - Cardiologue
            $medecin1 = User::firstOrCreate(
                ['email' => 'medecin1@mediconnect.com'],
                [
                    'name' => 'Dr. Jean Dupont',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (!$medecin1->hasRole('medecin')) {
                $medecin1->assignRole('medecin');
            }
            MedecinProfile::firstOrCreate(
                ['user_id' => $medecin1->id],
                [
                    'specialite_id' => $specialites->where('nom', 'Cardiologie')->first()->id ?? 1,
                    'telephone' => '0612345678',
                    'adresse' => '123 Rue de la Santé',
                    'ville' => 'Paris',
                    'description' => 'Cardiologue expérimenté avec 15 ans de pratique.',
                ]
            );
            $this->command->info('✓ Médecin 1 (Cardiologue): medecin1@mediconnect.com');

            // Médecin 2 - Dermatologue
            $medecin2 = User::firstOrCreate(
                ['email' => 'medecin2@mediconnect.com'],
                [
                    'name' => 'Dr. Marie Martin',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (!$medecin2->hasRole('medecin')) {
                $medecin2->assignRole('medecin');
            }
            MedecinProfile::firstOrCreate(
                ['user_id' => $medecin2->id],
                [
                    'specialite_id' => $specialites->where('nom', 'Dermatologie')->first()->id ?? 2,
                    'telephone' => '0623456789',
                    'adresse' => '456 Avenue des Médecins',
                    'ville' => 'Lyon',
                    'description' => 'Spécialiste en dermatologie esthétique et médicale.',
                ]
            );
            $this->command->info('✓ Médecin 2 (Dermatologue): medecin2@mediconnect.com');

            // Médecin 3 - Généraliste
            $medecin3 = User::firstOrCreate(
                ['email' => 'medecin3@mediconnect.com'],
                [
                    'name' => 'Dr. Pierre Dubois',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (!$medecin3->hasRole('medecin')) {
                $medecin3->assignRole('medecin');
            }
            MedecinProfile::firstOrCreate(
                ['user_id' => $medecin3->id],
                [
                    'specialite_id' => $specialites->where('nom', 'Médecine générale')->first()->id ?? 3,
                    'telephone' => '0634567890',
                    'adresse' => '789 Boulevard de la Médecine',
                    'ville' => 'Marseille',
                    'description' => 'Médecin généraliste pour toute la famille.',
                ]
            );
            $this->command->info('✓ Médecin 3 (Généraliste): medecin3@mediconnect.com');
        }

        // 6. Clients (5 exemples)
        for ($i = 1; $i <= 5; $i++) {
            $client = User::firstOrCreate(
                ['email' => "client{$i}@mediconnect.com"],
                [
                    'name' => "Client Test {$i}",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (!$client->hasRole('client')) {
                $client->assignRole('client');
            }
        }
        $this->command->info('✓ 5 Clients: client1@mediconnect.com à client5@mediconnect.com');

        // 7. Créer les liaisons validées entre Médecin 1 et Gestionnaire/Secrétaire
        if (isset($medecin1) && isset($gestionnaire)) {
            GestionnaireMedecin::firstOrCreate(
                [
                    'gestionnaire_id' => $gestionnaire->id,
                    'medecin_id' => $medecin1->id,
                ],
                [
                    'statut' => 'accepte',
                    'message' => 'Demande de liaison pour gestion administrative',
                ]
            );
            $this->command->info('✓ Liaison validée: Médecin 1 ↔ Gestionnaire');
        }

        if (isset($medecin1) && isset($secretaire)) {
            SecretaireMedecin::firstOrCreate(
                [
                    'secretaire_id' => $secretaire->id,
                    'medecin_id' => $medecin1->id,
                ],
                [
                    'statut' => 'accepte',
                    'message' => 'Demande de liaison pour gestion des rendez-vous',
                ]
            );
            $this->command->info('✓ Liaison validée: Médecin 1 ↔ Secrétaire');
        }

        $this->command->newLine();
        $this->command->info('=== RÉSUMÉ DES COMPTES CRÉÉS ===');
        $this->command->table(
            ['Rôle', 'Email', 'Mot de passe'],
            [
                ['Super Admin', 'admin@mediconnect.com', 'password'],
                ['Admin', 'admin.principal@mediconnect.com', 'password'],
                ['Gestionnaire', 'gestionnaire@mediconnect.com', 'password'],
                ['Secrétaire', 'secretaire@mediconnect.com', 'password'],
                ['Médecin 1', 'medecin1@mediconnect.com', 'password'],
                ['Médecin 2', 'medecin2@mediconnect.com', 'password'],
                ['Médecin 3', 'medecin3@mediconnect.com', 'password'],
                ['Client 1-5', 'client1-5@mediconnect.com', 'password'],
            ]
        );
        $this->command->newLine();
        $this->command->info('=== LIAISONS CRÉÉES ===');
        $this->command->line('✓ Dr. Jean Dupont (Médecin 1) ↔ Gestionnaire Test (accepté)');
        $this->command->line('✓ Dr. Jean Dupont (Médecin 1) ↔ Secrétaire Médicale (accepté)');
        $this->command->warn('⚠️  Changez ces mots de passe en production !');
    }
}
