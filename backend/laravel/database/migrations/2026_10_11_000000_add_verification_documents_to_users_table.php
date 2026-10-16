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
        Schema::table('users', function (Blueprint $table) {
            // Chemins (disque local privé) des documents fournis à l'inscription médecin
            $table->string('document_identite')->nullable()->after('hide');
            $table->string('justificatif_validite')->nullable()->after('document_identite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['document_identite', 'justificatif_validite']);
        });
    }
};
