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
            // Add phone column if it doesn't exist
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }
            // Add client_id if it doesn't exist
            if (!Schema::hasColumn('users', 'client_id')) {
                $table->string('client_id', 10)->nullable();
            }
            // Add isVerified column (default 1 - verified)
            if (!Schema::hasColumn('users', 'isVerified')) {
                $table->boolean('isVerified')->default(1);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['client_id', 'isVerified']);
        });
    }
};
