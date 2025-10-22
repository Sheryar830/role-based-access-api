<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Task extends Model
{
    protected $fillable = ['title', 'description', 'status', 'assigned_to', 'created_by'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Optional: restrict normal users to own/assigned tasks
    public function scopeVisibleFor($q, User $u)
    {
        if ($u->hasRole('super-admin') || $u->hasRole('manager')) return $q;
        return $q->where(fn($qq) => $qq->where('assigned_to', $u->id)->orWhere('created_by', $u->id));
    }
}
