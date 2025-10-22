<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Define the permissions your app needs (extend anytime)
        $permissions = [
            // user management
            'users.read',
            'users.create',
            'users.update',
            'users.delete',
            // role & permission management
            'roles.read',
            'roles.create',
            'roles.update',
            'roles.delete',
            'permissions.read',
            'permissions.create',
            'permissions.update',
            'permissions.delete',
            // task management (CRUD)
            'tasks.read',
            'tasks.create',
            'tasks.update',
            'tasks.delete',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name], ['display_name' => $name]);
        }

        $super = Role::firstOrCreate(['name' => 'super-admin'], ['display_name' => 'Super Admin']);
        $manager = Role::firstOrCreate(['name' => 'manager'], ['display_name' => 'Manager']);
        $user  = Role::firstOrCreate(['name' => 'user'], ['display_name' => 'User']);


        
        // super-admin gets EVERYTHING 
        $super->syncPermissions(Permission::pluck('id')->all());



        $manager->syncPermissions(Permission::whereIn('name', [
            'users.read',
            'users.update',
            'tasks.read',
            'tasks.create',
            'tasks.update',
        ])->pluck('id')->all());



        $user->syncPermissions(Permission::whereIn('name', [
            'tasks.read',
        ])->pluck('id')->all());
    }
}
