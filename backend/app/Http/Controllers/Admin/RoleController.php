<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // Show all roles
    public function index()
    {
        $roles = Role::with('permissions:id,name,display_name')->get();
        return view('admin.role.index', compact('roles'));
    }

    // Edit a specific role's permissions
    public function edit(Role $role)
    {
        if ($role->name === 'super-admin') {
            return redirect()->route('roles.index')
                ->with('error', 'Super Admin has all permissions by default and cannot be edited.');
        }

        $permissions = Permission::orderBy('display_name')->get();
        $rolePermissions = $role->permissions->pluck('id')->toArray();

        return view('admin.role.edit', compact('role', 'permissions', 'rolePermissions'));
    }

    // Update role permissions
    public function update(Request $request, Role $role)
    {
        if ($role->name === 'super-admin') {
            return redirect()->route('roles.index')
                ->with('error', 'Super Admin permissions cannot be changed.');
        }

        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($request->permissions ?? []);

        return redirect()->route('roles.index')
            ->with('success', 'Permissions updated successfully for ' . ucfirst($role->name));
    }
}
