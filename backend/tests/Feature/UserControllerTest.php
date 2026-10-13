<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_delete_themselves()
    {
        $role = Role::create(['name' => 'Admin']);
        
        $admin = User::create([
            'nom' => 'AdminNom',
            'prenom' => 'AdminPrenom',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/users/{$admin->id}");

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
        ]);
        
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_can_delete_other_users()
    {
        $role = Role::create(['name' => 'Admin']);
        
        $admin = User::create([
            'nom' => 'AdminNom',
            'prenom' => 'AdminPrenom',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $otherUser = User::create([
            'nom' => 'UserNom',
            'prenom' => 'UserPrenom',
            'email' => 'user@test.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/users/{$otherUser->id}");

        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('users', ['id' => $otherUser->id]);
    }

    public function test_admin_cannot_change_their_own_role()
    {
        $adminRole = Role::create(['name' => 'Admin']);
        $userRole = Role::create(['name' => 'User']);
        
        $admin = User::create([
            'nom' => 'AdminNom',
            'prenom' => 'AdminPrenom',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/users/{$admin->id}", [
            'role_id' => $userRole->id,
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Vous ne pouvez pas modifier votre propre rôle.'
        ]);
        
        $this->assertEquals($adminRole->id, $admin->fresh()->role_id);
    }

    public function test_admin_can_change_other_users_role()
    {
        $adminRole = Role::create(['name' => 'Admin']);
        $userRole = Role::create(['name' => 'User']);
        
        $admin = User::create([
            'nom' => 'AdminNom',
            'prenom' => 'AdminPrenom',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
        ]);

        $otherUser = User::create([
            'nom' => 'UserNom',
            'prenom' => 'UserPrenom',
            'email' => 'user@test.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/users/{$otherUser->id}", [
            'role_id' => $adminRole->id,
        ]);

        $response->assertStatus(200);
        $this->assertEquals($adminRole->id, $otherUser->fresh()->role_id);
    }
}
