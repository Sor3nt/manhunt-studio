<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/select2.min.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/component/fileTree.css">
    <link rel="stylesheet" href="css/component/iconBoxes.css">
    <link rel="stylesheet" href="css/component/info.css">
    <link rel="stylesheet" href="css/fontawesome/css/all.css">
    <link rel="stylesheet" href="css/studio.css">

    <script type="module" src="src/Studio.js"></script>
    <script type="module" src="src/Vendor/lottie-player.js"></script>


    <title>Manhunt Studio</title>
</head>
<body id="drop_zone" style="background: #262626">

<!---->
<div class="container-fluid vh-100" style="position: absolute; top: 0px; z-index: 1" id="loading">
    <div class="row" style="opacity: 0.8;background: #212529;width: 100vw; height: 100vh;"></div>

    <div style="
    position: absolute;

    top: 0;
    left: 0;
    right: 0;" >

        <div style="width: 300px; height: 300px; margin: 0 auto;">

x        <lottie-player src="/images/spinner.json"  background="transparent"  speed="1"  style="
        width: 300px;

        height: 300px;"  autoplay></lottie-player>
        </div>
        <h1 style="font-family: 'GF Ordner Inverted';
    font-weight: normal;
    font-style: normal; color: #fff;text-align: center;">Manhunt Studio</h1>

    </div>
</div>

<div class="container-fluid vh-100">
    <div class="row">
        <div class="col" data-component-section="top">

            <div style="height: 25px; background: #3e3e3e; color: #fff">
                <i class="fas fa-save" data-save></i>

            </div>


            <div style="float:right; color: #fff" id="status"></div>
        </div>
    </div>


    <div class="row">

        <!-- Menu Left -->
        <div class="col-2" data-component-section="left">

            <ul class="nav nav-tabs"></ul>
            <div class="nav-tabs-content"></div>
        </div>


        <!-- Inner -->
        <div class="col-8 vh-100">

            <!-- Main Content Layout Full -->
            <div class="col h-100" data-component-section="scene" style="position: relative">
                <div id="webgl" style="position: absolute; top:25px; width: 100%; height: calc(100% - 25px - 15px); background: #3e3e3e;"></div>

                <ul class="nav nav-tabs"></ul>
                <div class="nav-tabs-content">

                </div>

            </div>

            <!-- Bottom Element -->
<!--            <div class="col h-25" data-component-section="bottom">-->
<!---->
<!--                <ul class="nav nav-tabs"></ul>-->
<!--                <div class="nav-tabs-content"></div>-->
<!--            </div>-->
        </div>

        <!-- Menu Right -->
        <div class="col-2 vh-100">

            <!-- Upper menu -->
            <div class="col h-50" data-component-section="rightUpper">

                <ul class="nav nav-tabs"></ul>
                <div class="nav-tabs-content"></div>
            </div>

            <!-- Lower menu -->
            <div class="col h-50" data-component-section="rightLower">
                <ul class="nav nav-tabs"></ul>
                <div class="nav-tabs-content"></div>
            </div>

        </div>
    </div>


</div>

<script type="module">
    import Studio from './src/Studio.js';
    import './node_modules/jquery/dist/jquery.js';
    import FileDrop from "./src/FileDrop.js";

    Studio.boot();

    new FileDrop('drop_zone');
</script>

</body>
</html>