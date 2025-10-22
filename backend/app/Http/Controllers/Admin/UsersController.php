<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index()
    {
        // Eager-load roles to avoid N+1 queries
        $users = User::with('roles:id,name,display_name')->paginate(10);
        return view('admin.users.index', compact('users'));
    }

    public function edit(User $user)
    {
        // Hide Super Admin from dropdown
        $roles = Role::where('name', '!=', 'super-admin')
            ->select('id', 'name', 'display_name')
            ->orderBy('id')
            ->get();

        $currentRole = optional($user->roles->first())->name;

        return view('admin.users.edit', compact('user', 'roles', 'currentRole'));
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role'  => ['required', 'string', Rule::exists('roles', 'name')],
        ]);

        if ($data['role'] === 'super-admin') {
            return redirect()->back()->with('error', 'You cannot assign Super Admin role.');
        }

        $user->update([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()
            ->route('users.list')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // prevent deleting super admin
        if ($user->hasRole('super-admin')) {
            return redirect()->back()->with('error', 'You cannot delete the Super Admin account.');
        }

        // optional: prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.list')->with('success', 'User deleted successfully.');
    }
}
