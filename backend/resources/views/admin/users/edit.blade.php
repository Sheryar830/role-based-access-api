@extends('layouts.app')
@section('content')
    <div class="row m-1">
        <div class="col-12">
            <h4 class="main-title">Edit User</h4>
            <ul class="app-line-breadcrumbs mb-3">
                <li><a class="f-s-14 f-w-500" href="{{ route('users.list') }}">Users</a></li>
                <li class="active"><a class="f-s-14 f-w-500" href="#">Edit</a></li>
            </ul>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex flex-column gap-2">
                    <h5>Update user details & role</h5>
                    <p class="text-secondary">Change name, email, and assign a role.</p>
                </div>

                <div class="card-body">
                    <form class="row g-3 app-form" method="POST" action="{{ route('users.update', $user->id) }}">
                        @csrf
                        @method('PUT')

                        <div class="col-md-6">
                            <label class="form-label" for="name">User Name</label>
                            <input class="form-control @error('name') is-invalid @enderror" id="name" name="name"
                                type="text" value="{{ old('name', $user->name) }}">
                            @error('name')
                                <div class="invalid-feedback d-block">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="col-md-6">
                            <label class="form-label" for="email">Email</label>
                            <input class="form-control @error('email') is-invalid @enderror" id="email" name="email"
                                type="email" value="{{ old('email', $user->email) }}">
                            @error('email')
                                <div class="invalid-feedback d-block">{{ $message }}</div>
                            @enderror
                        </div>

                        @if (!auth()->user()->hasRole('super-admin') || !$user->hasRole('super-admin'))
                            <div class="col-md-6">
                                <label class="form-label" for="role">Role</label>
                                <select class="form-select @error('role') is-invalid @enderror" id="role"
                                    name="role">
                                    <option value="" disabled>Select a role</option>
                                    @foreach ($roles as $role)
                                        <option value="{{ $role->name }}"
                                            {{ old('role', $currentRole) === $role->name ? 'selected' : '' }}>
                                            {{ $role->display_name ?? ucfirst($role->name) }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('role')
                                    <div class="invalid-feedback d-block">{{ $message }}</div>
                                @enderror
                            </div>
                        @endif

                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Save changes</button>
                            <a href="{{ route('users.list') }}" class="btn btn-outline-secondary">Cancel</a>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
@endsection
