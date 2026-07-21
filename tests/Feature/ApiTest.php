<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_admin_can_login_and_receive_a_sanctum_token(): void
    {
        $this->postJson('/api/login', ['email' => 'admin@networkflow.com', 'password' => 'networkflow'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_database_api_requires_authentication(): void
    {
        $this->getJson('/api/customers')->assertUnauthorized();
    }

    public function test_customer_crud_persists_to_the_database(): void
    {
        Sanctum::actingAs(User::first(), ['admin']);

        $created = $this->postJson('/api/customers', [
            'name' => 'Railway Customer', 'phone' => '+62 812 0000 0000', 'email' => 'railway@example.com',
            'address' => 'Jakarta', 'package' => 'STANDARD', 'status' => 'ACTIVE', 'payment' => 'UNPAID',
        ])->assertCreated()->json('data');

        $this->assertDatabaseHas('customers', ['customer_code' => $created['id'], 'email' => 'railway@example.com']);

        $this->putJson('/api/customers/'.$created['id'], [
            'name' => 'Railway Customer Updated', 'phone' => '+62 812 0000 0000', 'email' => 'railway@example.com',
            'address' => 'Bandung', 'package' => 'PREMIUM', 'status' => 'ACTIVE', 'payment' => 'PAID',
        ])->assertOk()->assertJsonPath('data.package', 'PREMIUM');

        $this->deleteJson('/api/customers/'.$created['id'])->assertNoContent();
        $this->assertDatabaseMissing('customers', ['customer_code' => $created['id']]);
    }

    public function test_operational_endpoints_use_relational_data(): void
    {
        Sanctum::actingAs(User::first(), ['admin']);

        $this->getJson('/api/packages')->assertOk()->assertJsonCount(3, 'data');
        $customer = $this->getJson('/api/customers')->assertOk()->json('data.0');
        $this->postJson('/api/billing', ['customer_id' => $customer['id'], 'period' => 'AUG 2026', 'due_date' => '2026-08-10'])
            ->assertCreated()->assertJsonPath('data.customer_id', $customer['id']);

        $complaint = Complaint::first();
        $this->putJson('/api/complaints/'.$complaint->id, ['technician' => 'Test Technician', 'status' => 'PROCESS'])
            ->assertOk()->assertJsonPath('data.technician', 'Test Technician');

        $this->getJson('/api/reports')->assertOk()->assertJsonStructure(['data' => ['customers', 'billing', 'complaints', 'activities', 'generated_at']]);
    }
}
