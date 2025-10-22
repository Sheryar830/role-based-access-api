<!-- Menu Navigation starts -->
<nav>
    <div class="app-logo">
        <a class="logo d-inline-block" href="{{ route('dashboard') }}">
            <img alt="logo" src="{{ asset('assets/images/logo/1.png') }}" />
        </a>

        <span class="bg-light-primary toggle-semi-nav d-flex-center">
            <i class="bi bi-chevron-right"></i>
        </span>

        <div class="d-flex align-items-center nav-profile p-3">
            <span class="h-45 w-45 d-flex-center b-r-10 position-relative bg-danger m-auto">
                <img alt="avatar" class="img-fluid b-r-10" src="{{ asset('assets/images/avatar/woman.jpg') }}" />
                <span class="position-absolute top-0 end-0 p-1 bg-success border border-light rounded-circle"></span>
            </span>

            <div class="flex-grow-1 ps-2">
                <h6 class="text-primary mb-0">{{ Auth::user()->name }}</h6>
                <p class="text-muted f-s-12 mb-0">
                    {{ ucfirst(Auth::user()->roles->first()->display_name ?? (Auth::user()->roles->first()->name ?? 'User')) }}
                </p>
            </div>

            <div class="dropdown profile-menu-dropdown">
                <a data-bs-toggle="dropdown" role="button"><i class="bi bi-gear fs-5"></i></a>
                <ul class="dropdown-menu">
                    <li class="dropdown-item">
                        <a class="f-w-500" href="{{ route('profile.edit') }}">
                            <i class="bi bi-person-circle pe-1 f-s-20"></i> Profile Details
                        </a>
                    </li>
                    <li class="app-divider-v dotted py-1"></li>
                    <li class="dropdown-item">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                class="mb-0 text-danger border-0 bg-transparent p-0 d-flex align-items-center">
                                <i class="bi bi-box-arrow-right pe-1 f-s-20"></i> Log Out
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="app-nav" id="app-simple-bar">
        <ul class="main-nav p-0 mt-2">

            <li class="menu-title"><span>Dashboard</span></li>


            @permission('tasks.read')
                <li>
                    <a href="{{ route('tasks.index') }}">
                        </i> Tasks
                    </a>
                </li>
            @endpermission






            @role('super-admin')
                <li class="menu-title mt-3"><span>Administration</span></li>

                <li><a href="{{ route('roles.index') }}"></i> Roles & Permissions</a></li>
            @endrole



            @role('super-admin')
                @permission('users.read')
                    <li>
                        <a data-bs-toggle="collapse" href="#usersMenu" aria-expanded="false">
                            </i> Users
                        </a>
                        <ul class="collapse" id="usersMenu">
                            <li><a href="{{ route('users.list') }}">All Users</a></li>
                        </ul>
                    </li>
                @endpermission
            @endrole

        </ul>
    </div>

    <div class="menu-navs">
        <span class="menu-previous"><i class="bi bi-chevron-left"></i></span>
        <span class="menu-next"><i class="bi bi-chevron-right"></i></span>
    </div>
</nav>
<!-- Menu Navigation ends -->
