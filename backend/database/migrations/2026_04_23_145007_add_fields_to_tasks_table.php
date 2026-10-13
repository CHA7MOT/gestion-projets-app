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
        Schema::table('tasks', function (Blueprint $table) {
            $table->enum('task_type', ['Installation', 'Maintenance', 'Fixing', 'Removement']);
            $table->string('task_id', 5);
            $table->enum('status', ['Just Started', 'In Progress', 'About to Finish', 'Finished']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['task_type', 'task_id', 'status']);
        });
    }
};
