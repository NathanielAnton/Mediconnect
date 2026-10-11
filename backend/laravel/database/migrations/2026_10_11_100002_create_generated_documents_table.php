<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('generated_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_profile_id')->constrained('medecin_profiles')->cascadeOnDelete();
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->nullOnDelete();
            $table->foreignId('pdf_template_id')->nullable()->constrained('pdf_templates')->nullOnDelete();
            $table->enum('type', ['ordonnance', 'facture']);
            $table->string('titre');
            $table->string('chemin');
            $table->json('donnees')->nullable();
            $table->unsignedInteger('taille');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_documents');
    }
};
