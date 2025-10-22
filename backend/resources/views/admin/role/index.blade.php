@extends('layouts.app')
@section('content')

<div class="row m-1">
    <div class="col-12">
        <h5>Roles & Permissions</h5>
        <ul class="app-line-breadcrumbs mb-3">
            <li><a class="f-s-14 f-w-500" href="#"><i class="ph-duotone ph-lock f-s-16"></i> Access Control</a></li>
            <li class="active"><a class="f-s-14 f-w-500" href="#">Roles</a></li>
        </ul>
    </div>
</div>

<div class="col-xl-12">
    <div class="card">
        <div class="card-header">
            <h5>Manage Roles & Permissions</h5>
            <p class="text-muted mb-0">Edit permission access for Manager and User roles.</p>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Role Name</th>
                            <th>Display Name</th>
                            <th>Permissions Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($roles as $role)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ ucfirst($role->name) }}</td>
                                <td>{{ $role->display_name ?? ucfirst($role->name) }}</td>
                                <td>{{ $role->permissions->count() }}</td>
                                <td>
                                    @if($role->name !== 'super-admin')
                                        <a href="{{ route('roles.edit', $role->id) }}" class="btn btn-sm btn-primary">
                                            Edit Permissions
                                        </a>
                                    @else
                                        <span class="badge bg-secondary">Locked</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

@endsection
