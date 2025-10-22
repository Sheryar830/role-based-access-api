@extends('layouts.app')
@section('content')
    <!-- Breadcrumb start -->
   <div class="row m-1">
    <div class="col-12">
        <h5>User Management</h5>
        <ul class="app-line-breadcrumbs mb-3">
            <li>
                <a class="f-s-14 f-w-500" href="#">
                    <span>
                        <i class="ph-duotone ph-users-three f-s-16"></i> Users
                    </span>
                </a>
            </li>
            <li class="active">
                <a class="f-s-14 f-w-500" href="#">User List</a>
            </li>
        </ul>
    </div>
</div>

    <!-- Breadcrumb end -->
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header">
                <h5>User List</h5>
                <p style="margin-top: 8px">Below is the complete list of system users with their assigned roles and current
                    status.</p>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-bottom-border table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($users as $user)
                                <tr>
                                   <td>{{ $loop->iteration }}</td>

                                  
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <p class="mb-0 f-w-500">{{ $user->name }}</p>
                                        </div>
                                    </td>

                                   
                                    <td>{{ $user->email ?? '—' }}</td>

                                    
                                    <td>
                                        @forelse($user->roles as $role)
                                            <span class="badge bg-info me-1">
                                                {{ $role->display_name ?? ucfirst($role->name) }}
                                            </span>
                                        @empty
                                            <span class="text-muted">No role</span>
                                        @endforelse
                                    </td>

                                   
                                    <td>
                                        <span
                                            class="badge text-light-primary">{{ $user->is_active ?? true ? 'active' : 'inactive' }}</span>
                                    </td>

                                   
                                    <td>{{ optional($user->created_at)->format('d M, Y') ?? '—' }}</td>

                                  
                                    <td class="text-nowrap">
                                       
                                        <a href="{{ route('users.edit', $user->id) }}"
                                            class="btn btn-sm btn-primary">Edit</a>

                                      
                                        @if (!$user->hasRole('super-admin'))
                                            <button type="button" class="btn btn-sm btn-danger delete-btn"
                                                data-id="{{ $user->id }}">
                                                Delete
                                            </button>

                                            <form id="delete-form-{{ $user->id }}"
                                                action="{{ route('users.destroy', $user->id) }}" method="POST"
                                                style="display:none;">
                                                @csrf
                                                @method('DELETE')
                                            </form>
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


<script>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.dataset.id;

            Swal.fire({
                title: 'Are you sure?',
                text: "This action will permanently delete the user.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('delete-form-' + userId).submit();
                }
            });
        });
    });
});
</script>