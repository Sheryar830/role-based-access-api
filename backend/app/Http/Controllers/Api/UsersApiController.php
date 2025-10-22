<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsersApiController extends Controller
{


    public function index(Request $request)
    {
        $perPage = (int)($request->integer('per_page') ?: 20);

        $q = User::query()
            ->with('roles:id,name,display_name')
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'super-admin');
            }); // 🔥 Exclude users with the super-admin role

        if ($search = trim($request->get('q', ''))) {
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $q->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'status' => true,
            'data'   => UserResource::collection($users),
            'meta'   => [
                'current_page' => $users->currentPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }


    public function show(User $user)
    {
        $user->load('roles:id,name,display_name', 'permissions:id,name,display_name');

        return response()->json([
            'status' => true,
            'data'   => new UserResource($user),
        ]);
    }

    public function update(Request $request, User $user)
    {

        if ($user->hasRole('super-admin') && !auth()->user()->hasRole('super-admin')) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot modify a Super Admin account.',
            ], 403);
        }

        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],

            'role'  => ['nullable', 'string', Rule::exists('roles', 'name')],
        ]);


        if (!empty($data['role']) && $data['role'] === 'super-admin' && !auth()->user()->hasRole('super-admin')) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot assign the Super Admin role.',
            ], 403);
        }

        $user->update([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);


        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        $user->load('roles:id,name,display_name');

        return response()->json([
            'status'  => true,
            'message' => 'User updated successfully.',
            'data'    => new UserResource($user),
        ]);
    }


    public function destroy(User $user)
    {
        if ($user->hasRole('super-admin')) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot delete the Super Admin account.',
            ], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'status'  => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
