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
        Schema::table('hopitals', function (Blueprint $table) {
            // Masque l'établissement des pages publiques ; masque en cascade ses médecins
            if (!Schema::hasColumn('hopitals', 'hide')) {
                $table->boolean('hide')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hopitals', function (Blueprint $table) {
            $table->dropColumn(['hide']);
        });
    }
};
