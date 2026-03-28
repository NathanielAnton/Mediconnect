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
            // Only add client_id if it doesn't exist
            if (!Schema::hasColumn('users', 'client_id')) {
                $table->string('client_id', 10)->unique()->after('phone');
            }
            // Add isVerified column (default 1 - verified)
            if (!Schema::hasColumn('users', 'isVerified')) {
                $table->boolean('isVerified')->default(1)->after('client_id');
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
