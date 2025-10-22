<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{


    public function index()
    {
        $tasks = Task::with(['assignee', 'creator'])
            ->visibleFor(auth()->user())
            ->latest()->paginate(10);

        $users = User::orderBy('name')->get(['id', 'name']);
        return view('tasks.index', compact('tasks', 'users'));
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,in_progress,done',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
        $data['created_by'] = auth()->id();
        Task::create($data);
        return back()->with('ok', 'Task created');
    }

    public function update(Request $r, Task $task)
    {
        $task->update($r->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,in_progress,done',
            'assigned_to' => 'nullable|exists:users,id',
        ]));
        return back()->with('ok', 'Task updated');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return back()->with('ok', 'Task deleted');
    }
}
