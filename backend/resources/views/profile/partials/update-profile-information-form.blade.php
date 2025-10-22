@php($user = $user ?? auth()->user())

<section>
    <h3 class="h4 fw-bold mb-2">Profile Information</h3>
    <p class="text-muted mb-3">Update your account's profile information and email address.</p>

    <form id="send-verification" method="POST" action="{{ route('verification.send') }}">
        @csrf
    </form>

    <form method="POST" action="{{ route('profile.update') }}" class="mt-3">
        @csrf
        @method('patch')

        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input id="name" name="name" type="text" class="form-control @error('name') is-invalid @enderror"
                value="{{ old('name', $user->name) }}" required autocomplete="name" autofocus>
            @error('name')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>

        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input id="email" name="email" type="email"
                class="form-control @error('email') is-invalid @enderror" value="{{ old('email', $user->email) }}"
                required autocomplete="username">
            @error('email')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>

        @if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && !$user->hasVerifiedEmail())
            <div class="alert alert-warning d-flex justify-content-between align-items-center">
                <div>Your email address is unverified.</div>
                <button form="send-verification" class="btn btn-sm btn-outline-primary">Resend verification
                    email</button>
            </div>
            @if (session('status') === 'verification-link-sent')
                <div class="alert alert-success mt-2">
                    A new verification link has been sent to your email address.
                </div>
            @endif
        @endif

        <div class="d-flex align-items-center gap-3">
            <button class="btn btn-primary">Save</button>
            @if (session('status') === 'profile-updated')
                <span class="text-success">Saved.</span>
            @endif
        </div>
    </form>
</section>
