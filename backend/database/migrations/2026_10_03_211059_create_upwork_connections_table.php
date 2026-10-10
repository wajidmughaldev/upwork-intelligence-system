<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('upwork_connections', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('upwork')->index();
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->string('token_type')->default('Bearer');
            $table->text('scope')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('org_uid')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_role')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('raw_metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upwork_connections');
    }
};
