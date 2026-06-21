<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SignatureFactory extends Factory
{
    public function definition(): array
    {
        return [
            'document_id' => \App\Models\Document::factory(),
            'signer_id' => \App\Models\User::factory(),
            'signed_at' => fake()->dateTimeThisMonth(),
            'ip_address' => fake()->ipv4(),
        ];
    }
}
