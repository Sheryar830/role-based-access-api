<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    public function register(Request $request)
{
    // Normalize email (prevents duplicate-case issues)
    $request->merge(['email' => mb_strtolower(trim($request->input('email')))]);

    $data = $request->validate([
        'name'     => ['required', 'string', 'max:255'],
        'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', Rules\Password::defaults()],
    ]);

    return DB::transaction(function () use ($data) {
        // Create user
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Ensure default role exists
        $roleId = Role::where('name', 'user')->value('id');
        if (! $roleId) {
            throw ValidationException::withMessages([
                'role' => 'Registration failed: default role "user" not found.',
            ]);
        }

        // Assign role (single-role system; pass id or name)
        $user->syncRoles([$roleId]);

        // Optional: verify role attached
        if (! $user->roles()->whereKey($roleId)->exists()) {
            throw ValidationException::withMessages([
                'role' => 'Registration failed: unable to assign default role.',
            ]);
        }

        // Issue token
        $token = $user->createToken('mobile')->plainTextToken;

        // Return 201 Created
        return response()->json([
            'status'  => true,
            'message' => 'Registered successfully.',
            'token'   => $token,
            'user'    => new UserResource($user->load('roles')),
        ], 201);
    });
}


    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid credentials.',
            ], 422);
        }



        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'status'  => true,
            'message' => 'Logged in successfully.',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Logged out.',
        ]);
    }




    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'user'   => new UserResource($request->user()),
        ]);
    }
}
