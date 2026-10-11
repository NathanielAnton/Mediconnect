<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('pdf_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_profile_id')->constrained('medecin_profiles')->cascadeOnDelete();
            $table->string('nom');
            $table->enum('type', ['ordonnance', 'facture']);
            $table->string('format', 10)->default('A4');
            $table->json('layout');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_templates');
    }
};
