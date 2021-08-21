import Loader from "./Plugin/Loader.js";
import Config from "./Config.js";
import Game from "./Plugin/Game.js";
import Components from "./Plugin/Components.js";
import Layout from "./Layout.js";
import WebGL from "./WebGL.js";
import Status from "./Status.js";
import {Save} from "./Save.js";

export default class Studio{

    static fileFormats = [
        'inst',     // Instances from Manhunt 1/2
        'mdl',      // Manhunt 2 Model
        'dff',      // Manhunt 1 Model
        'tex',      // Manhunt 2 Texture
        'txd',      // Manhunt 1 Texture
        'bsp',      // Manhunt 1/2 Level/Map
        'glg',      // Manhunt 2 INI Files

    ];

    static settings = {

        isLocalInstallation: false, //document.location.hostname === "localhost",

        //it is disabled because of perforamcen issue in the current three version
        outlineActiveObject: false
    };

    static FOV = 57.29578; //Default MH2 FOV

    /**
     * Global {Result} types for the {Storage} class
     */
    static MAP = 1;
    static MODEL = 2;
    static GLG = 3;
    static ANIMATION = 4;
    static INST = 5;
    static TEXTURE = 6;
    static TVP = 7;
    static ENTITY = 8;
    static MLS = 9;
    static WORLD = 10;
    static IMPORTED = 11;
    static FILE = 12;

    /**
     * @type {Config}
     */
    static config;

    static registerPlugins(){
        Loader.registerPlugins();
        Game.registerGames();
        Components.registerSections();
    }

    static boot() {

        Status.element = jQuery('#status');
        WebGL.boot();
        Studio.registerPlugins();

        new Save();


        if (Studio.settings.isLocalInstallation){

            Studio.config = new Config(function (config) {
                Layout.createDefaultLayout();

                WebGL.render();

                if (config.games.length > 0){
                    Studio.config.getGame(0).loadLevel("asylum", function () {
                        console.log("loaded");

                        Status.hide();
                    });

                    Studio.config.getGame(1).loadLevel("A01_Escape_Asylum", function () {
                        console.log("loaded");

                    });
                }else{
                    Status.hide();
                    Status.showWelcome();


                }


            });
        }else{
            Layout.createDefaultLayout();
            WebGL.render();
            Status.hide();
            Status.showWelcome();
        }

    }

    //
    // static onGamePathsKnown () {
    //
    //     MANHUNT.engine.render();
    //
    //     //for level selection mini pic
    //     // let storage = new MANHUNT.storage.Storage({ _game: 'mh2', _platform: 'pc'});
    //     // self._globalStorage.tex = storage.create('tex');
    //
    //     MANHUNT.frontend.modal.handler.show('levelSelection', { gameId: 0 });
    //     // new MANHUNT.scene.AnimationPortView();
    // }
    //
    // static loadLevel (gameId, levelInfo) {
    //     MANHUNT.resources.handler.fromLevel(gameId, levelInfo, function(storage){
    //         new MANHUNT.scene.Level(gameId, levelInfo, storage);
    //
    //     });
    // }

}
