<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Multipurpose, super flexible, powerful, clean modern responsive bootstrap 5 admin template">
    <meta name="keywords"
        content="admin template, ki-admin admin template, dashboard template, flat admin template, responsive admin template, web app">
    <meta name="author" content="la-themes">
    <link rel="icon" type="image/x-icon" href="{{ asset('assets/images/logo/favicon.png') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('assets/images/logo/favicon.png') }}">
    <title>@yield('title', 'Dashboard ')</title>

    <!-- Animation css -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/animation/animate.min.css') }}">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com/">
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">


    <!-- Flag Icon css -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/flag-icons-master/flag-icon.css') }}">
    <!-- Tabler icons -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/tabler-icons/tabler-icons.css') }}">
    <!-- Apexcharts -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/apexcharts/apexcharts.css') }}">
    <!-- Glightbox -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/glightbox/glightbox.min.css') }}">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/bootstrap/bootstrap.min.css') }}">
    <!-- Simplebar -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/simplebar/simplebar.css') }}">
    <!-- App css -->
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <!-- Responsive css -->
    <link rel="stylesheet" href="{{ asset('assets/css/responsive.css') }}">

    @stack('styles')
</head>

<body>
    <div class="app-wrapper">
        <div class="loader-wrapper">
            <div class="loader_24"></div>
        </div>

        <!-- Sidebar Navigation -->
        @include('layouts.partials.sidebar')

        <!-- Main Content -->
        <div class="app-content">
            <!-- Header -->
            @include('layouts.partials.header')

            <!-- Page Content -->
            <main>
                <div class="container-fluid">

                    @yield('content')
                </div>
            </main>

            <!-- Footer -->
            @include('layouts.partials.footer')
        </div>

        <!-- Scroll to top -->
        <div class="go-top">
            <span class="progress-value"><i class="ti ti-chevron-up"></i></span>
        </div>
    </div>

    <!-- Scripts -->
    <script src="{{ asset('assets/js/jquery-3.6.3.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/bootstrap/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/simplebar/simplebar.js') }}"></script>
    <script src="{{ asset('assets/vendor/phosphor/phosphor.js') }}"></script>
    <script src="{{ asset('assets/vendor/glightbox/glightbox.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/apexcharts/apexcharts.min.js') }}"></script>
    <script src="{{ asset('assets/js/customizer.js') }}"></script>
    <script src="{{ asset('assets/js/ecommerce_dashboard.js') }}"></script>
    <script src="{{ asset('assets/js/script.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @if (session('success'))
        <script>
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: @json(session('success')),
                timer: 2000,
                showConfirmButton: false
            });
        </script>
    @endif
    @if (session('error'))
        <script>
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: @json(session('error'))
            });
        </script>
    @endif
    @stack('scripts')
</body>

</html>
