<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horaires_medecins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_id')->constrained('medecin_profiles')->onDelete('cascade');
            $table->enum('jour', ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->boolean('actif')->default(true);
            $table->timestamps();

            // Un médecin ne peut avoir qu'un horaire par jour
            $table->unique(['medecin_id', 'jour']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horaires_medecins');
    }
};