<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indisponibilites_medecins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_id')->constrained('medecin_profiles')->onDelete('cascade');
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->string('motif');
            $table->timestamps();

            // Index pour les recherches par date
            $table->index(['medecin_id', 'date_debut', 'date_fin']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indisponibilites_medecins');
    }
};