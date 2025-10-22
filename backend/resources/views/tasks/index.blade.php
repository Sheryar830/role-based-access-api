@extends('layouts.app')

@section('content')

    <div class="row m-1">
        <div class="col-12">
            <h5>Tasks Management</h5>
            <ul class="app-line-breadcrumbs mb-3">
                <li><a class="f-s-14 f-w-500" href="#"><i class="ph-duotone ph-lock f-s-16"></i>Tasks</a></li>
                <li class="active"><a class="f-s-14 f-w-500" href="#">Tasks list</a></li>
            </ul>
        </div>
    </div>

    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Tasks</h5>

            {{-- Only Super Admin + Manager see "Add Task" --}}
            @permission('tasks.create')
                <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#createForm">
                    + Add Task
                </button>
            @endpermission
        </div>

        {{-- CREATE FORM (hidden for read-only users) --}}
        @permission('tasks.create')
            <div id="createForm" class="collapse border-top p-3">
                <form method="POST" action="{{ route('tasks.store') }}" class="row g-2">
                    @csrf
                    <div class="col-md-3">
                        <input name="title" class="form-control" placeholder="Title" required>
                    </div>
                    <div class="col-md-4">
                        <input name="description" class="form-control" placeholder="Description">
                    </div>
                    <div class="col-md-2">
                        <select name="status" class="form-select">
                            <option value="todo">To-Do</option>
                            <option value="in_progress">In-Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select name="assigned_to" class="form-select">
                            <option value="">Unassigned</option>
                            @foreach (\App\Models\User::orderBy('name')->get() as $u)
                                <option value="{{ $u->id }}">{{ $u->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-success w-100">Save</button>
                    </div>
                </form>
            </div>
        @endpermission

        {{-- LIST --}}
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Assignee</th>
                        <th>Created By</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($tasks as $t)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>{{ $t->title }}</td>
                            <td><span class="badge text-bg-secondary">{{ ucfirst(str_replace('_', ' ', $t->status)) }}</span>
                            </td>
                            <td>{{ $t->assignee?->name ?? '—' }}</td>
                            <td>{{ $t->creator?->name }}</td>
                            <td class="text-end">

                                {{-- Edit inline (only for those with update perm) --}}
                                @permission('tasks.update')
                                    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse"
                                        data-bs-target="#edit-{{ $t->id }}">Edit</button>
                                @endpermission

                                {{-- Delete (only for those with delete perm) --}}
                                @permission('tasks.delete')
                                    <form action="{{ route('tasks.destroy', $t) }}" method="POST" class="d-inline"
                                        onsubmit="return confirm('Delete this task?')">
                                        @csrf @method('DELETE')
                                        <button class="btn btn-sm btn-danger">Delete</button>
                                    </form>
                                @endpermission
                            </td>
                        </tr>

                        {{-- Inline EDIT row (only visible for permitted roles) --}}
                        @permission('tasks.update')
                            <tr id="edit-{{ $t->id }}" class="collapse">
                                <td colspan="6">
                                    <form method="POST" action="{{ route('tasks.update', $t) }}" class="row g-2">
                                        @csrf @method('PUT')
                                        <div class="col-md-3">
                                            <input name="title" class="form-control" value="{{ $t->title }}" required>
                                        </div>
                                        <div class="col-md-4">
                                            <input name="description" class="form-control" value="{{ $t->description }}">
                                        </div>
                                        <div class="col-md-2">
                                            <select name="status" class="form-select">
                                                @foreach (['todo', 'in_progress', 'done'] as $s)
                                                    <option value="{{ $s }}" @selected($t->status === $s)>
                                                        {{ ucfirst(str_replace('_', ' ', $s)) }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <select name="assigned_to" class="form-select">
                                                <option value="">Unassigned</option>
                                                @foreach (\App\Models\User::orderBy('name')->get() as $u)
                                                    <option value="{{ $u->id }}" @selected($t->assigned_to === $u->id)>
                                                        {{ $u->name }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="col-md-1">
                                            <button class="btn btn-primary ">Update</button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        @endpermission
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="card-footer">
            {{ $tasks->links() }}
        </div>
    </div>
@endsection
