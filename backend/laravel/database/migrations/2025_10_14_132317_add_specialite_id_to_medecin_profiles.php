<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medecin_profiles', function (Blueprint $table) {
            // Supprimer l'ancienne colonne string
            $table->dropColumn('specialite');
            
            // Ajouter la clé étrangère vers specialites
            $table->foreignId('specialite_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('medecin_profiles', function (Blueprint $table) {
            $table->dropForeign(['specialite_id']);
            $table->dropColumn('specialite_id');
            $table->string('specialite')->nullable();
        });
    }
};