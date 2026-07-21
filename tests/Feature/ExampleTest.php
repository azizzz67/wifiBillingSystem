<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_all_network_flow_spa_routes_return_the_application_shell(): void
    {
        foreach (['/login', '/customers', '/customers/NF-481', '/packages', '/billing', '/complaints', '/reports'] as $route) {
            $this->get($route)
                ->assertOk()
                ->assertSee('id="app"', false);
        }
    }
}
