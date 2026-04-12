<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medecin_profiles', function (Blueprint $table) {
            $table->string('photo_profil')->nullable()->after('telephone');
        });
    }

    public function down(): void
    {
        Schema::table('medecin_profiles', function (Blueprint $table) {
            $table->dropColumn('photo_profil');
        });
    }
};
