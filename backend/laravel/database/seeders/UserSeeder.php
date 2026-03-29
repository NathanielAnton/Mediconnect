<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MedecinProfile;
use App\Models\Specialite;
use App\Models\Gestionnaire;
use App\Models\Directeur;
use App\Models\Hopital;
use App\Models\DemandeDirecteur;
use App\Models\Secretaire;
use App\Models\SecretaireMedecin;
use App\Models\HoraireMedecin;
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
            ['email' => 'superadmin@mediconnect.com'],
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
        $this->command->info('✓ Super Admin: superadmin@mediconnect.com');

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

        // 3. Créer l'hôpital central d'abord
        $hopital = Hopital::firstOrCreate(
            ['name' => 'Hôpital Central de Paris'],
            [
                'adresse' => '1 Avenue du Docteur Fleming',
                'telephone' => '0142344321',
                'ville' => 'Paris',
            ]
        );
        $this->command->info('✓ Hôpital: Hôpital Central de Paris');

        // 3.5 Gestionnaire
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

        // Créer le profil gestionnaire lié à l'hôpital
        Gestionnaire::firstOrCreate(
            ['user_id' => $gestionnaire->id],
            [
                'hopital_id' => $hopital->id,
                'name' => 'Gestionnaire Test',
            ]
        );
        $this->command->info('✓ Gestionnaire: gestionnaire@mediconnect.com');

        // 4. Directeur

        $directeur = User::firstOrCreate(
            ['email' => 'directeur@mediconnect.com'],
            [
                'name' => 'Directeur Test',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$directeur->hasRole('directeur')) {
            $directeur->assignRole('directeur');
        }

        // Créer le profil directeur
        Directeur::firstOrCreate(
            [
                'user_id' => $directeur->id,
                'hopital_id' => $hopital->id,
            ],
            [
                'name' => 'Directeur Test',
            ]
        );
        $this->command->info('✓ Directeur: directeur@mediconnect.com');

        // Créer une entrée de demande directeur approuvée
        DemandeDirecteur::firstOrCreate(
            ['email' => 'demande.directeur@mediconnect.com'],
            [
                'name' => 'Directeur Demande',
                'password' => Hash::make('password'),
                'hopital_name' => 'Hôpital Clément Hospital',
                'hopital_adresse' => '12 Rue de la Santé',
                'hopital_telephone' => '0142113456',
                'hopital_ville' => 'Lyon',
                'statut' => 'approuvee',
                'commentaire_admin' => 'Demande approuvée et traitée',
            ]
        );
        $this->command->info('✓ Demande Directeur créée: demande.directeur@mediconnect.com');

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

        // Créer le profil secrétaire lié à l'hôpital
        Secretaire::firstOrCreate(
            ['user_id' => $secretaire->id],
            [
                'hopital_id' => $hopital->id,
                'name' => 'Secrétaire Médicale',
            ]
        );
        $this->command->info('✓ Secrétaire: secretaire@mediconnect.com');

        // 5. Médecins (3 exemples avec différentes spécialités)
        $specialites = Specialite::all();

        if ($specialites->count() >= 3) {
            // Médecin 1 - Cardiologue
            $medecin1 = User::firstOrCreate(
                ['email' => 'medecin1@mediconnect.com'],
                [
                    'name' => 'Jean Dupont',
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
                    'hopital_id' => $hopital->id ?? null,
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
                    'name' => 'Marie Martin',
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
                    'hopital_id' => $hopital->id ?? null,
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
                    'name' => 'Pierre Dubois',
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
                    'hopital_id' => $hopital->id ?? null,
                    'specialite_id' => $specialites->where('nom', 'Médecine générale')->first()->id ?? 3,
                    'telephone' => '0634567890',
                    'adresse' => '789 Boulevard de la Médecine',
                    'ville' => 'Marseille',
                    'description' => 'Médecin généraliste pour toute la famille.',
                ]
            );
            $this->command->info('✓ Médecin 3 (Généraliste): medecin3@mediconnect.com');
        }

        // 5.5 Médecin Indépendant (sans hôpital)
        $medecinIndependant = User::firstOrCreate(
            ['email' => 'medecin.independant@mediconnect.com'],
            [
                'name' => 'Dr. Sophie Laurent',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$medecinIndependant->hasRole('medecin')) {
            $medecinIndependant->assignRole('medecin');
        }
        $medecinIndependantProfile = MedecinProfile::firstOrCreate(
            ['user_id' => $medecinIndependant->id],
            [
                'hopital_id' => null,  // Médecin indépendant
                'specialite_id' => $specialites->first()->id ?? 1,
                'telephone' => '0645678901',
                'adresse' => '999 Rue de l\'Indépendance',
                'ville' => 'Toulouse',
                'description' => 'Cabinet médical privé - consultation sur rendez-vous.',
            ]
        );
        $this->command->info('✓ Médecin Indépendant: medecin.independant@mediconnect.com');

        // Secrétaire du médecin indépendant
        $secretaireIndependante = User::firstOrCreate(
            ['email' => 'secretaire.independante@mediconnect.com'],
            [
                'name' => 'Assistante Cabinet Laurent',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$secretaireIndependante->hasRole('secretaire')) {
            $secretaireIndependante->assignRole('secretaire');
        }
        Secretaire::firstOrCreate(
            ['user_id' => $secretaireIndependante->id],
            [
                'hopital_id' => null,  // Secrétaire indépendante
                'name' => 'Assistante Cabinet Laurent',
            ]
        );
        // Création de la liaison entre secrétaire et médecin indépendant
        SecretaireMedecin::firstOrCreate(
            [
                'secretaire_id' => \App\Models\Secretaire::where('user_id', $secretaireIndependante->id)->first()->id,
                'medecin_id' => $medecinIndependantProfile->id,
            ],
            [
                'statut' => 'acceptee',
            ]
        );
        $this->command->info('✓ Secrétaire Indépendante: secretaire.independante@mediconnect.com (liée à Dr. Sophie Laurent)');

        // 5.6 Configurer les horaires des médecins
        $jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

        // Horaires standards pour les médecins de l'hôpital (08:00-12:00 et 14:00-18:00)
        foreach ($jours as $jour) {
            // Médecin 1
            $medecin1Profile = MedecinProfile::where('user_id', $medecin1->id)->first();
            if ($medecin1Profile) {
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin1Profile->id, 'jour' => $jour, 'creneau' => 'matin'],
                    ['heure_debut' => '08:00:00', 'heure_fin' => '12:00:00', 'actif' => true]
                );
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin1Profile->id, 'jour' => $jour, 'creneau' => 'apres_midi'],
                    ['heure_debut' => '14:00:00', 'heure_fin' => '18:00:00', 'actif' => true]
                );
            }

            // Médecin 2
            $medecin2Profile = MedecinProfile::where('user_id', $medecin2->id)->first();
            if ($medecin2Profile) {
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin2Profile->id, 'jour' => $jour, 'creneau' => 'matin'],
                    ['heure_debut' => '08:00:00', 'heure_fin' => '12:00:00', 'actif' => true]
                );
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin2Profile->id, 'jour' => $jour, 'creneau' => 'apres_midi'],
                    ['heure_debut' => '14:00:00', 'heure_fin' => '18:00:00', 'actif' => true]
                );
            }

            // Médecin 3
            $medecin3Profile = MedecinProfile::where('user_id', $medecin3->id)->first();
            if ($medecin3Profile) {
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin3Profile->id, 'jour' => $jour, 'creneau' => 'matin'],
                    ['heure_debut' => '08:00:00', 'heure_fin' => '12:00:00', 'actif' => true]
                );
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecin3Profile->id, 'jour' => $jour, 'creneau' => 'apres_midi'],
                    ['heure_debut' => '14:00:00', 'heure_fin' => '18:00:00', 'actif' => true]
                );
            }

            // Médecin Indépendant (décalage +1 heure: 09:00-13:00 et 15:00-19:00)
            if ($medecinIndependantProfile) {
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecinIndependantProfile->id, 'jour' => $jour, 'creneau' => 'matin'],
                    ['heure_debut' => '09:00:00', 'heure_fin' => '13:00:00', 'actif' => true]
                );
                HoraireMedecin::firstOrCreate(
                    ['medecin_id' => $medecinIndependantProfile->id, 'jour' => $jour, 'creneau' => 'apres_midi'],
                    ['heure_debut' => '15:00:00', 'heure_fin' => '19:00:00', 'actif' => true]
                );
            }
        }
        $this->command->info('✓ Horaires configurés pour tous les médecins');

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

        $this->command->newLine();
        $this->command->info('=== RÉSUMÉ DES COMPTES CRÉÉS ===');
        $this->command->table(
            ['Rôle', 'Email', 'Mot de passe'],
            [
                ['Super Admin', 'superadmin@mediconnect.com', 'password'],
                ['Admin', 'admin.principal@mediconnect.com', 'password'],
                ['Gestionnaire', 'gestionnaire@mediconnect.com', 'password'],
                ['Directeur', 'directeur@mediconnect.com', 'password'],
                ['Secrétaire', 'secretaire@mediconnect.com', 'password'],
                ['Médecin 1', 'medecin1@mediconnect.com', 'password'],
                ['Médecin 2', 'medecin2@mediconnect.com', 'password'],
                ['Médecin 3', 'medecin3@mediconnect.com', 'password'],
                ['Médecin Indépendant', 'medecin.independant@mediconnect.com', 'password'],
                ['Secrétaire Indépendante', 'secretaire.independante@mediconnect.com', 'password'],
                ['Client 1-5', 'client1-5@mediconnect.com', 'password'],
            ]
        );
        $this->command->newLine();
        $this->command->info('=== HÔPITAL CRÉÉ ===');
        $this->command->line('✓ Hôpital Central de Paris (Directeur Test)');
        $this->command->newLine();
        $this->command->info('=== DEMANDES DIRECTEUR CRÉÉES ===');
        $this->command->line('✓ Demande approuvée: demande.directeur@mediconnect.com');
        $this->command->newLine();
        $this->command->info('=== LIAISONS CRÉÉES ===');
        $this->command->line('✓ Dr. Jean Dupont (Médecin 1) ↔ Gestionnaire Test (accepté)');
        $this->command->line('✓ Dr. Jean Dupont (Médecin 1) ↔ Secrétaire Médicale (accepté)');
        $this->command->line('✓ Dr. Sophie Laurent (Médecin Indépendant) ↔ Assistante Cabinet Laurent (accepté)');
        $this->command->warn('⚠️  Changez ces mots de passe en production !');
    }
}
