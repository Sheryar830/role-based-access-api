<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Laratrust helpers:
        $roles = $this->roles()->pluck('name')->values();
        $permissions = $this->allPermissions()->pluck('name')->values();

        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
            'roles'       => $roles,
            'permissions' => $permissions,
        ];
    }
}
