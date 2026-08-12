<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'Administrateur',
        ]);

        Role::create([
            'name' => 'Responsable',
        ]);

        Role::create([
            'name' => 'Utilisateur',
        ]);
    }
}