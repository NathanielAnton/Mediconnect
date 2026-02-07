<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gestionnaire_medecin', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gestionnaire_id');
            $table->unsignedBigInteger('medecin_id');
            $table->enum('statut', ['en_attente', 'accepte', 'refuse'])->default('en_attente');
            $table->text('message')->nullable();
            $table->timestamps();

            // Clés étrangères avec suppression en cascade
            $table->foreign('gestionnaire_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('medecin_id')->references('id')->on('users')->onDelete('cascade');

            // Contrainte unique pour éviter les doublons
            $table->unique(['gestionnaire_id', 'medecin_id'], 'unique_gestionnaire_medecin_liaison');

            // Index pour améliorer les performances
            $table->index('medecin_id');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gestionnaire_medecin');
    }
};
