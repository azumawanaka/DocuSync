<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'user@demo.com'],
            [
                'name' => 'Filjumar Jumamoy',
                'password' => bcrypt('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user2@demo.com'],
            [
                'name' => 'Jade Orpheus Jumamoy',
                'password' => bcrypt('password'),
            ]
        );
    }
}