<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('pdf_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_profile_id')->constrained('medecin_profiles')->cascadeOnDelete();
            $table->string('nom');
            $table->string('chemin');
            $table->string('mime', 50);
            $table->unsignedInteger('taille');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_images');
    }
};
