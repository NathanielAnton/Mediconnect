<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_id')->constrained('medecin_profiles')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->enum('statut', ['confirmé', 'annulé', 'en_attente', 'terminé'])->default('en_attente');
            $table->text('motif');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index pour les recherches
            $table->index(['medecin_id', 'date_debut']);
            $table->index(['client_id', 'date_debut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};