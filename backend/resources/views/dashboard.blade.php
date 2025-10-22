@extends('layouts.app')

@section('content')
@php
  use Carbon\Carbon;
  $u = auth()->user();
  $hour = now()->format('H');
  $hello = $hour < 12 ? 'Good morning' : ($hour < 18 ? 'Good afternoon' : 'Good evening');
@endphp

<div class="container-fluid py-5">
  <div class="d-flex flex-column align-items-center text-center">
    <div class="rounded-circle bg-primary bg-opacity-10 p-4 mb-3">
      <i class="ri-user-smile-line fs-1 text-primary"></i>
    </div>

    <h3 class="fw-semibold mb-1">{{ $hello }}, {{ $u->name }} 👋</h3>

    <div class="mb-3">
      @foreach($u->roles as $r)
        <span class="badge bg-light text-secondary">{{ $r->display_name ?? $r->name }}</span>
      @endforeach
    </div>

    <p class="text-muted mb-4">
      Welcome back to your dashboard.
      @if(!empty($u->email))
        <br><small class="text-muted">Logged in as <strong>{{ $u->email }}</strong></small>
      @endif
    </p>

    <a href="{{ route('profile.edit') }}" class="btn btn-primary">
      <i class="ri-settings-3-line me-1"></i> Manage Profile
    </a>
  </div>
</div>
@endsection
