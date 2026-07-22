<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_customer_can_login_and_receive_customer_token(): void
    {
        $customer = Customer::where('status', 'ACTIVE')->firstOrFail();
        $customer->update(['password' => Hash::make('customer-secret')]);

        $this->postJson('/api/mobile/login', [
            'email' => $customer->email,
            'password' => 'customer-secret',
            'device_name' => 'test-device',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_id', $customer->customer_code)
            ->assertJsonStructure(['token', 'token_type', 'data']);
    }

    public function test_mobile_endpoints_require_customer_authentication(): void
    {
        $this->getJson('/api/mobile/me')->assertUnauthorized();
        $this->getJson('/api/mobile/invoices')->assertUnauthorized();
        $this->getJson('/api/mobile/complaints')->assertUnauthorized();
    }

    public function test_customer_only_sees_their_own_invoices(): void
    {
        $customers = Customer::take(2)->get();
        $customerA = $customers->first();
        $customerB = $customers->last();
        $foreignInvoice = Invoice::where('customer_id', $customerB->id)->first();

        if (! $foreignInvoice) {
            $foreignInvoice = Invoice::create([
                'invoice_number' => 'INV-FOREIGN',
                'customer_id' => $customerB->id,
                'internet_package_id' => $customerB->internet_package_id,
                'period' => 'JUL 2026',
                'amount' => 100000,
                'status' => 'UNPAID',
                'due_date' => now()->addWeek(),
            ]);
        }

        Sanctum::actingAs($customerA, ['customer']);

        $response = $this->getJson('/api/mobile/invoices')->assertOk();
        $this->assertNotContains($foreignInvoice->invoice_number, collect($response->json('data'))->pluck('invoice_number'));
        $this->getJson('/api/mobile/invoices/'.$foreignInvoice->invoice_number)->assertNotFound();
    }

    public function test_complaint_is_always_linked_to_authenticated_customer(): void
    {
        $customer = Customer::where('status', 'ACTIVE')->firstOrFail();
        Sanctum::actingAs($customer, ['customer']);

        $this->postJson('/api/mobile/complaints', [
            'subject' => 'Internet lambat',
            'description' => 'Koneksi internet melambat sejak pagi.',
            'category' => 'CONNECTION',
            'priority' => 'NORMAL',
            'customer_id' => Customer::whereKeyNot($customer->id)->value('id'),
        ])->assertCreated();

        $this->assertDatabaseHas('complaints', [
            'customer_id' => $customer->id,
            'issue' => 'Internet lambat',
        ]);
    }
}
