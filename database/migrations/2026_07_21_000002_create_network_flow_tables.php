<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internet_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedInteger('speed_mbps');
            $table->unsignedBigInteger('price');
            $table->string('color', 20)->default('blue');
            $table->unsignedSmallInteger('device_limit')->default(1);
            $table->string('support_label');
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_code')->unique();
            $table->string('name');
            $table->string('phone', 30);
            $table->string('email')->unique();
            $table->text('address');
            $table->foreignId('internet_package_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('ACTIVE')->index();
            $table->string('payment_status', 20)->default('PAID')->index();
            $table->date('joined_at')->nullable();
            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('internet_package_id')->constrained()->restrictOnDelete();
            $table->string('period', 30);
            $table->unsignedBigInteger('amount');
            $table->string('status', 20)->default('UNPAID')->index();
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('issue');
            $table->text('description')->nullable();
            $table->string('priority', 20)->default('MEDIUM')->index();
            $table->string('status', 20)->default('OPEN')->index();
            $table->string('technician')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('internet_packages');
    }
};
