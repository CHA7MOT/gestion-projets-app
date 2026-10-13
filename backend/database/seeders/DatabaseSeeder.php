<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = ['Admin', 'User', 'Supervisor'];

        foreach ($roles as $roleName) {
            $role = \App\Models\Role::whereRaw('LOWER(name) = ?', [strtolower($roleName)])->first();
            if ($role) {
                $role->update(['name' => $roleName]);
            } else {
                $role = \App\Models\Role::create(['name' => $roleName]);
            }
            if ($roleName === 'Admin') {
                $adminRole = $role;
            }
        }

        \App\Models\User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'specialite' => 'Direction',
                'role_id' => $adminRole->id,
            ]
        );
    }

}
