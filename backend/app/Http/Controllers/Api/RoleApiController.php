<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;

class RoleApiController extends Controller
{


   
    public function index()
    {
        $roles = Role::with('permissions:id,name,display_name')->get();

        return response()->json([
            'status' => true,
            'data' => $roles,
        ]);
    }

    
    public function show(Role $role)
    {
        if ($role->name === 'super-admin') {
            return response()->json([
                'status'  => false,
                'message' => 'Super Admin has all permissions and cannot be edited.',
            ], 403);
        }

        $role->load('permissions:id,name,display_name');
        $permissions = Permission::orderBy('display_name')->get();

        return response()->json([
            'status' => true,
            'data' => [
                'role' => $role,
                'all_permissions' => $permissions,
                'role_permission_ids' => $role->permissions->pluck('id'),
            ],
        ]);
    }

    
    public function update(Request $request, Role $role)
    {
        if ($role->name === 'super-admin') {
            return response()->json([
                'status'  => false,
                'message' => 'Super Admin permissions cannot be modified.',
            ], 403);
        }

        $request->validate([
            'permissions'   => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($request->permissions ?? []);

        return response()->json([
            'status'  => true,
            'message' => 'Permissions updated successfully for ' . ucfirst($role->name),
            'data'    => $role->load('permissions:id,name,display_name'),
        ]);
    }
}
