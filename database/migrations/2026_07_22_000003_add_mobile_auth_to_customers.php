<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('password')->nullable()->after('email');
        });

        Schema::table('complaints', function (Blueprint $table) {
            $table->string('category', 30)->default('OTHER')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('complaints', fn (Blueprint $table) => $table->dropColumn('category'));
        Schema::table('customers', fn (Blueprint $table) => $table->dropColumn('password'));
    }
};
