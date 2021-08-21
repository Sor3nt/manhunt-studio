<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/select2.min.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="css/component/fileTree.css">
    <link rel="stylesheet" href="css/component/entityTree.css">
    <link rel="stylesheet" href="css/component/iconBoxes.css">
    <link rel="stylesheet" href="css/component/info.css">
    <link rel="stylesheet" href="css/fontawesome/css/all.css">
    <link rel="stylesheet" href="css/studio.css">

    <script type="module" src="src/Studio.js"></script>
    <script type="module" src="src/Vendor/lottie-player.js"></script>
    <script type="module" src="/src/Vendor/pako_inflate.min.js"></script>


    <title>Manhunt Studio</title>
</head>
<body id="drop_zone" style="background: #262626">

<!---->
<div class="container-fluid vh-100" style="position: absolute; top: 0px; z-index: 10;" id="loading">
    <div class="row" style="opacity: 0.8;background: #212529;width: 100vw; height: 100vh;"></div>

    <div style="
    position: absolute;

    top: 0;
    left: 0;
    right: 0;" >

        <div style="width: 300px; height: 300px; margin: 0 auto;">

        <lottie-player src="images/spinner.json"  background="transparent"  speed="1"  style="
        width: 300px;
        height: 300px;" loop autoplay></lottie-player>
        </div>
        <h1 style="font-family: 'GF Ordner Inverted';
    font-weight: normal;
    font-style: normal; color: #fff;text-align: center;">Loading</h1>

    </div>
</div>

<!---->
<div class="container-fluid vh-100" style="position: absolute; top: 0; z-index: 10;display: none" id="welcome">
    <div class="row" style="opacity: 0.8;background: #212529; height: 100vh;"></div>

    <div style="
    position: absolute;

    top: 0;
    left: 0;
    right: 0;" >


        <div class="container-fluid vh-100 overScroll" >
            <div class="row">
                <div class="col-2">

                </div>

                <div class="col-8" style="margin-top: 50px;height: 360px;">

                    <div style="">

                        <lottie-player src="images/spinner.json"  background="transparent"  speed="1"  style="
                            width: 100px;
                            top: 0;
                            position: absolute;
                            height: 100px;" loop autoplay></lottie-player>

                        <h1 style="font-family: 'GF Ordner Inverted';
                            font-weight: normal;
                            margin-top: 15px;
                            font-style: normal; color: #fff;text-align: center;">
                            Manhunt Studio
                        </h1>
                        <h5 style="font-family: 'GF Ordner Inverted'; color:#fff; margin-top: -15px;font-size: 10px;text-align: center">A free and open source toolkit to quickly modify Rockstar`s game Manhunt.</h5>
                    </div>

                    <div class="container" style="margin-top: 50px">

                        <div class="row" style="height: 140px">
                            <div class="col-6" style="text-align: right; border-right: 1px solid #750202; padding-right: 15px">
                                <div style="display: inline-block">
                                    <h5 style="font-family: 'GF Ordner Inverted'; color:#fff;text-decoration:
    underline">Instructions</h5>

                                    <ul style="color: #fff; font-size: 12px;float: right;">
                                        <li style="font-size: 14px">
                                            Please use <b style="color: orange">Chrome</b> Browser!<br/>
                                            Simply <b style="color: orange">drag</b> a file into this window to start the wizard 🤷‍♂️
                                        </li>
                                        <li>&nbsp;</li>
                                        <li>&nbsp;</li>
                                    </ul>

                                </div>

                                <h5 style="font-family: 'GF Ordner Inverted'; color:#fff;text-decoration:
underline">Current Features</h5>
                                <ul style="color: #fff; font-size: 10px;float: right;">
                                    <li>
                                        Level Entity Handler <i class="fas fa-check"></i>️
                                    </li>
                                    <li>
                                        Semantic Entity View <i class="fas fa-check"></i>️
                                    </li>
                                    <li>
                                        View textures, models and maps from Manhunt 1 and 2<i class="fas fa-check"></i>️
                                    </li>
                                    <li>
                                        <b>Move</b>, <b>Rotate</b> and save any game objects <i class="fas fa-check"></i>️
                                    </li>

                                </ul>
                            </div>
                            <div class="col-6" style="padding-left:15px">


                                <h6 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration:
underline">Supported Formats</h6>
                                <ul style="color: #fff; font-size: 10px">
                                <li>

                                    <ul style="color: #fff;font-size: 10px">
                                        <li>Manhunt 1 & 2 Map (scene1.bsp)</li>
                                        <li>Manhunt 1 & 2 Texture (.txd/.tex) (PC,PSP,PS2,XBOX,WII)</li>
                                        <li>Manhunt 1 & 2 Instances (.inst)</li>
                                        <li>Manhunt 1 & 2 Models (.dff/.mdl)</li>
                                        <li>Manhunt Container Format (.pak)</li>
                                    </ul>
                                </li>
                                </ul>


                                <br />
                                <h5 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration:
underline">Changelog</h5>
                                <ul style="color: #fff; font-size: 10px">
                                    <li><b>XX-08-2021</b>: Manhunt 2 Support, Semantic Entity View, Speed modifier,<br/> Transparence fixes, navigation fixes and more</li>
                                    <li><b>07-08-2021</b>: Search feature & Bugfixes</li>
                                    <li><b>30-07-2021</b>: Initial release 🎉</li>
                                </ul>
                            </div>
                        </div>
                    </div>



                </div>

                <div class="col-2">
                </div>


            </div>

            <div class="row">
                <div class="col-12" style="text-align: center;">

                    <h6 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration:
underline">Credits</h6>


                    <ul style="color: #fff; font-size: 10px">
                        <li><b style="color: orange">Sor3nt</b> (Developer of MHS)</li>
                        <li>Special thanks to <b style="color: orange">MAJEST1C_R3</b> and <b style="color: orange">Leeao</b> for countless problem solutions and much more!</li>
                        <li>Also big thanks to <b style="color: orange">errmaccer</b>, <b style="color: orange">ZT</b>, <b style="color: orange">DerWaschbärKönig</b> and <b style="color: orange">Miauz</b>! The support from you is great!</li>
                        <li>&nbsp;</li>
                        <li>&nbsp;</li>
                    </ul>

                </div>
            </div>

            <div class="row">
                <div class="col-12" style="text-align: center;">

                    <h6 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration:
underline">Tutorials</h6>


                    <ul style="color: #fff; font-size: 10px">
                        <li><a style="color: orange" href="https://www.youtube.com/watch?v=ORxvxcWNby8" target="_blank">Release Video</a></li>
                        <li><a style="color: orange" href="https://youtu.be/Fu2JxqhYD2U?t=356" target="_blank">Release Video (español. thx "Der Ritter")</a></li>
                        <li>&nbsp;</li>
                        <li>&nbsp;</li>
                    </ul>

                </div>
            </div>

            <div class="row">
                <div class="col-12" style="text-align: center;">

                    <h6 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration:
underline">Support and more</h6>


                    <ul style="color: #fff; font-size: 10px">
                        <li>Join our <a style="color: orange" href="https://discord.gg/EfDh5Vv3Ga" target="_blank">discord</a></li>
                        <li>Add a <a style="color: orange" href="https://github.com/Sor3nt/manhunt-studio/issues/new" target="_blank">ticket</a></li>
                        <li>Help <a style="color: orange" href="https://github.com/Sor3nt/manhunt-studio/" target="_blank">development</a></li>
                    </ul>

                </div>
            </div>

        </div>


    </div>
</div>

<!---->
<div class="container-fluid vh-100" style="position: absolute; top: 0; z-index: 10; display: none" id="import">
    <div class="row" style="opacity: 0.8;background: #212529;width: 100vw; height: 100vh;"></div>

    <div style="
    position: absolute;

    top: 0;
    left: 0;
    right: 0;" >


        <div class="container-fluid vh-100">
            <div class="row">
                <div class="col-2">

                </div>

                <div class="col-8" style="margin-top: 50px;height: 285px;">

                    <div style="">

                        <lottie-player src="images/spinner.json"  background="transparent"  speed="1"  style="
                            width: 100px;
                            top: 0;
                            position: absolute;
                            height: 100px;" loop autoplay></lottie-player>

                        <h1 style="font-family: 'GF Ordner Inverted';
                            font-weight: normal;
                            margin-top: 15px;
                            font-style: normal; color: #fff;text-align: center;">
                            Import wizard
                        </h1>
                    </div>

                    <div class="container" style="margin-top: 30px">

                        <div class="row" style="height: 140px">
                            <div class="col-6" style="text-align: right; border-right: 1px solid #750202; padding-right: 15px">
                                <h5 style="font-family: 'GF Ordner Inverted'; color:#fff;text-decoration:
underline">Select Level</h5>

                                <p style="color: #fff; font-size: 10px">Selection of the <b style="color: orange">correct</b> level is only required for <b>map view</b></p>

                                <select data-fied="level" name="level">
                                    <option value="none" selected>Please select</option>
                                    <option value="asylum">asylum</option>
                                    <option value="attic">attic</option>
                                    <option value="bonus1">bonus1</option>
                                    <option value="bonus2">bonus2</option>
                                    <option value="bonus3">bonus3</option>
                                    <option value="cellblock">cellblock</option>
                                    <option value="church2">church2</option>
                                    <option value="der2">der2</option>
                                    <option value="derelict">derelict</option>
                                    <option value="estate_ext">estate_ext</option>
                                    <option value="journo_streets">journo_streets</option>
                                    <option value="jury_turf">jury_turf</option>
                                    <option value="mall">mall</option>
                                    <option value="mansion_int">mansion_int</option>
                                    <option value="pharm_wks">pharm_wks</option>
                                    <option value="prison">prison</option>
                                    <option value="ramirez">ramirez</option>
                                    <option value="scrap">scrap</option>
                                    <option value="scrap2">scrap2</option>
                                    <option value="subway">subway</option>
                                    <option value="trainyard">trainyard</option>
                                    <option value="weasel">weasel</option>
                                    <option value="zoo">zoo</option>
                                    <option value="zoo2">zoo2</option>
                                </select>



                            </div>
                            <div class="col-6" style="padding-left:15px">


                                <h6 style="font-family: 'GF Ordner Inverted'; color:#fff; text-decoration: underline">Files</h6>

                                <ul style="color: #fff;font-size: 10px" data-id="file-list">
                                    <li><span class="badge badge-danger" data-file-id="model">x</span>Model (modelspc.dff)</li>
                                    <li><span class="badge badge-danger" data-file-id="map">x</span>Map (scene1.bsp)</li>
                                    <li><span class="badge badge-danger" data-file-id="modelTexture">x</span>Textures for Model (modelspc.txd)</li>
                                    <li><span class="badge badge-danger" data-file-id="mapTexture">x</span>Textures for Map (scene1pc.txd)</li>
                                    <li><span class="badge badge-danger" data-file-id="instances1">x</span>Instances 1 (entity.inst)</li>
                                    <li><span class="badge badge-danger" data-file-id="instances2">x</span>Instances 2 (entity2.inst)</li>
                                    <li><span class="badge badge-danger" data-file-id="glg">x</span>Records (ManHunt.pak)</li>
                                </ul>


                            </div>
                        </div>

                        <button data-import type="button" disabled class="btn btn-danger float-right" style="font-family: 'GF Ordner Inverted';">IMPORT</button>
                    </div>



                </div>

                <div class="col-2">
                </div>


            </div>
        </div>


    </div>
</div>

<div class="container-fluid vh-100">
    <div class="row">
        <div class="col" data-component-section="top">

            <div style="height: 25px; background: #3e3e3e; color: #fff">
                <i class="fas fa-save" data-save></i>
<!--                <input type="file" multiple webkitdirectory id="dropFolder"/>-->
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

                <style>
                    .info {
                        position: absolute;
                        z-index: 3;
                        top: 35px;
                        width: 100%;
                        text-align: center;
                        user-select: none;
                        pointer-events: none;
                        color: #eee;
                    }


                    .info b {
                        color: orange;
                    }
                </style>

                <div class="info" data-info-id="world" style="display: none">
                    <b>WASD</b> move, <b>Q|E</b> up | down, <b>I</b> object selection on, <b>left shift</b> move multiplier<br/>
                    <b>ESC</b> leave pointerlock
                </div>

                <div class="info" data-info-id="object" style="display: none">
                    mouse <b>MOVE</b> look around, mouse <b>SCROLL</b> zoom in | out
                </div>


                <div class="info" data-info-id="select" style="display: none">
                    mouse <b>CLICK</b> on object, <b>I</b> object selection off
                </div>

                <div class="info" data-info-id="transform" style="display: none">
                    <b>W</b> position, <b>E</b> rotation, <b>I</b> object selection off
                </div>



                <div id="webgl" style="z-index: 1;position: absolute; top:25px; width: 100%; height: calc(100% - 25px - 15px); background: #3e3e3e;"></div>

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

    jQuery.expr[':'].icontains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };

    Studio.boot();

    new FileDrop('drop_zone');
</script>

</body>
</html>