<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class ProfileController extends Controller
{
    
    public function show(Request $request)
    {
        return response()->json([
            'status' => true,
            'user'   => new UserResource($request->user()),
        ]);
    }

   
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'  => ['sometimes','required','string','max:255'],
            'email' => [
                'sometimes','required','email','max:255',
                Rule::unique('users','email')->ignore($user->id),
            ],
        ]);

        $user->fill($data)->save();

        return response()->json([
            'status'  => true,
            'message' => 'Profile updated.',
            'user'    => new UserResource($user),
        ]);
    }

   
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required','string'],
            'password'         => ['required', Rules\Password::defaults(), 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'Password updated.',
        ]);
    }
}
