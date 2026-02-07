<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('secretaire_medecin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('secretaire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('medecin_id')->constrained('users')->onDelete('cascade');
            $table->enum('statut', ['en_attente', 'accepte', 'refuse'])->default('en_attente');
            $table->text('message')->nullable(); // Message optionnel du secrétaire
            $table->timestamps();

            // Index pour éviter les doublons et optimiser les requêtes
            $table->unique(['secretaire_id', 'medecin_id']);
            $table->index('medecin_id');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('secretaire_medecin');
    }
};
