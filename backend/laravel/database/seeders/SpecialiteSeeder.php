<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialite;

class SpecialiteSeeder extends Seeder
{
    public function run()
    {
        $specialites = [
            ['nom' => 'Généraliste', 'slug' => 'generaliste'],
            ['nom' => 'Dentiste', 'slug' => 'dentiste'],
            ['nom' => 'Cardiologue', 'slug' => 'cardiologue'],
            ['nom' => 'Dermatologue', 'slug' => 'dermatologue'],
            ['nom' => 'Pédiatre', 'slug' => 'pediatre'],
            ['nom' => 'Gynécologue', 'slug' => 'gynecologue'],
            ['nom' => 'Ophtalmologue', 'slug' => 'ophtalmologue'],
            ['nom' => 'Psychiatre', 'slug' => 'psychiatre'],
            ['nom' => 'Radiologue', 'slug' => 'radiologue'],
            ['nom' => 'Chirurgien', 'slug' => 'chirurgien'],
            ['nom' => 'Orthopédiste', 'slug' => 'orthopediste'],
            ['nom' => 'Neurologue', 'slug' => 'neurologue'],
            ['nom' => 'ORL', 'slug' => 'orl'],
            ['nom' => 'Urologue', 'slug' => 'urologue'],
            ['nom' => 'Endocrinologue', 'slug' => 'endocrinologue'],
        ];

        foreach ($specialites as $specialite) {
            Specialite::create($specialite);
        }
    }
}