<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskApiController extends Controller
{
    public function index(Request $request)
    {

        $perPage = (int)($request->integer('per_page') ?: 20);
        $user = $request->user();

        $q = Task::with(['assignee:id,name', 'creator:id,name'])
            ->visibleFor($user);

        if ($s = trim($request->get('q', ''))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('title', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%");
            });
        }

        if ($status = $request->get('status')) {
            $q->where('status', $status);
        }

        if ($assigned = $request->get('assigned_to')) {
            $q->where('assigned_to', $assigned);
        }

        if ($creator = $request->get('created_by')) {
            $q->where('created_by', $creator);
        }

        if ($request->boolean('mine')) {
            $q->where(function ($qq) use ($user) {
                $qq->where('created_by', $user->id)
                    ->orWhere('assigned_to', $user->id);
            });
        }

        $tasks = $q->latest()->paginate($perPage);

        return response()->json([
            'status' => true,
            'data'   => $tasks->items(),
            'meta'   => [
                'current_page' => $tasks->currentPage(),
                'per_page'     => $tasks->perPage(),
                'total'        => $tasks->total(),
                'last_page'    => $tasks->lastPage(),
            ],
        ]);
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status'      => ['required', 'in:todo,in_progress,done'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        // ✅ temporary debug
        \Log::info('Task store payload', $data);

        if (!empty($data['assigned_to'])) {
            $deny = $this->validateAssigneeIsRegularUser((int)$data['assigned_to']);
            if ($deny !== true) return $deny;
        }

        $data['created_by'] = $request->user()->id;

        try {
            $task = Task::create($data)->load(['assignee:id,name', 'creator:id,name']);
        } catch (\Throwable $e) {
            \Log::error('Task create error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Task created',
            'data'    => $task,
        ], 201);
    }

    
    public function show(Request $request, Task $task)
    {
        if (!$this->canSee($task, $request->user())) {
            return response()->json(['status' => false, 'message' => 'Not allowed'], 403);
        }

        return response()->json([
            'status' => true,
            'data'   => $task->load(['assignee:id,name', 'creator:id,name']),
        ]);
    }


    public function update(Request $request, Task $task)
    {
       
        if (!$this->canSee($task, $request->user())) {
            return response()->json(['status' => false, 'message' => 'Not allowed'], 403);
        }


        $rawAssigned = $request->input('assigned_to', null);
        if ($rawAssigned === '' || $rawAssigned === '0' || $rawAssigned === 0) {
            $request->merge(['assigned_to' => null]);
        }

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status'      => ['required', 'in:todo,in_progress,done'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);


        if (array_key_exists('assigned_to', $data) && !is_null($data['assigned_to'])) {
            $deny = $this->validateAssigneeIsRegularUser((int) $data['assigned_to']);
            if ($deny !== true) {

                return $deny;
            }
        }

        $task->update($data);

        return response()->json([
            'status'  => true,
            'message' => 'Task updated',
            'data'    => $task->fresh()->load(['assignee:id,name', 'creator:id,name']),
        ]);
    }

   
    public function destroy(Request $request, Task $task)
    {


        if (!$this->canSee($task, $request->user())) {
            return response()->json(['status' => false, 'message' => 'Not allowed'], 403);
        }

        $task->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Task deleted',
        ]);
    }

    private function canSee(Task $task, User $u): bool
    {
        if ($u->hasRole('super-admin') || $u->hasRole('manager')) return true;
        return $task->created_by === $u->id || $task->assigned_to === $u->id;
    }


    private function validateAssigneeIsRegularUser(int $userId)
    {
        $assignee = User::with('roles:id,name')->find($userId);

        if (!$assignee) {
            return response()->json([
                'status'  => false,
                'message' => 'Assignee not found.',
            ], 422);
        }

        // ✅ Manual role check
        $roles = $assignee->roles->pluck('name')->toArray();

        if (in_array('super-admin', $roles) || in_array('manager', $roles)) {
            return response()->json([
                'status'  => false,
                'message' => 'Assignee must be a regular user.',
            ], 422);
        }

        return true;
    }
}
