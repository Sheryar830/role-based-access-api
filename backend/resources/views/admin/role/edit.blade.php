@extends('layouts.app')
@section('content')

<div class="row m-1">
    <div class="col-12">
        <h5>Edit Role Permissions</h5>
        <ul class="app-line-breadcrumbs mb-3">
            <li><a class="f-s-14 f-w-500" href="{{ route('roles.index') }}"><i class="ph-duotone ph-lock f-s-16"></i> Roles</a></li>
            <li class="active"><a class="f-s-14 f-w-500" href="#">Edit Permissions</a></li>
        </ul>
    </div>
</div>

<div class="col-xl-12">
    <div class="card">
        <div class="card-header">
            <h5>Manage Permissions for <span class="text-primary">{{ ucfirst($role->name) }}</span></h5>
            <p class="text-muted mb-0">Select permissions to assign to this role.</p>
        </div>

        <div class="card-body">
            <form action="{{ route('roles.update', $role->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row">
                    @foreach($permissions as $permission)
                        <div class="col-md-4 mb-2">
                            <div class="form-check">
                                <input class="form-check-input"
                                       type="checkbox"
                                       name="permissions[]"
                                       value="{{ $permission->id }}"
                                       id="perm-{{ $permission->id }}"
                                       {{ in_array($permission->id, $rolePermissions) ? 'checked' : '' }}>
                                <label class="form-check-label" for="perm-{{ $permission->id }}">
                                    {{ $permission->display_name ?? ucfirst($permission->name) }}
                                </label>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <a href="{{ route('roles.index') }}" class="btn btn-outline-secondary">Cancel</a>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection
