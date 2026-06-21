<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'action' => fake()->randomElement(['signed', 'uploaded', 'expired', 'login']),
            'description' => fake()->sentence(),
            'ip_address' => fake()->ipv4(),
        ];
    }
}
