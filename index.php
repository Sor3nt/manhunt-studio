<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/select2.min.css">

    <script type="module" src="/src/Studio.js"></script>


    <title>Manhunt Studio</title>
</head>
<body id="drop_zone">

<!---->
<!--<div class="container-fluid vh-100" style="position: absolute; z-index: 1">-->
<!--    <div class="row">-->
<!--        <div class="col-2"> </div>-->
<!--        <div class="col-8">-->
<!---->
<!--            <div class="row vh-100">-->
<!--                <div class="col-3 bg-light" data-component-section="modalLeft"></div>-->
<!--                <div class="col-9" style="background: transparent">inner</div>-->
<!--            </div>-->
<!---->
<!---->
<!--        </div>-->
<!--        <div class="col-2"></div>-->
<!--    </div>-->
<!--</div>-->

<div class="container-fluid vh-100">
    <div class="row">
        <div class="col" data-component-section="top"> Main Menu</div>
    </div>


    <div class="row">

        <!-- Menu Left -->
        <div class="col-2" data-component-section="left">

            <ul class="nav nav-tabs"></ul>
            <div class="nav-tabs-content"></div>
        </div>


        <!-- Inner -->
        <div class="col-8 vh-100">

            <!-- Main Content -->
            <div class="col h-75" data-component-section="scene" style="position: relative">
                <div id="webgl" style="position: absolute; top:50px; width: 100%; height: 100%; background: darkseagreen;"></div>

                <ul class="nav nav-tabs"></ul>
                <div class="nav-tabs-content"></div>

            </div>

            <!-- Bottom Element -->
            <div class="col h-25" data-component-section="bottom">

                <ul class="nav nav-tabs"></ul>
                <div class="nav-tabs-content"></div>
            </div>
        </div>

        <!-- Menu Right -->
        <div class="col-2 vh-100">

            <!-- Upper menu -->
            <div class="col h-50" data-component-section="rightUpper">
                col 1 h50
            </div>

            <!-- Lower menu -->
            <div class="col h-50" data-component-section="rightLower">
                col 2 h50
            </div>

        </div>
    </div>


</div>

<script type="module">
    import Studio from './src/Studio.js';
    import  './../../node_modules/jquery/dist/jquery.js';
    import FileDrop from "./src/FileDrop.js";

    Studio.boot();

    new FileDrop('drop_zone');
</script>

</body>
</html>