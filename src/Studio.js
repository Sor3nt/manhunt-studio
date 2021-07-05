import Loader from "./Plugin/Loader.js";
import Config from "./Config.js";
import Game from "./Plugin/Game.js";
import Components from "./Plugin/Components.js";
import Layout from "./Layout.js";
import WebGL from "./WebGL.js";

export default class Studio{


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

    /**
     * @type {Tab}
     */
    static tabHandler;

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

        WebGL.boot();
        Studio.registerPlugins();

        Studio.config = new Config(function () {
            Layout.createDefaultLayout();

            WebGL.render();
            //
            // Studio.config.getGame(0).loadLevel("der2", function () {
            //     console.log("loaded");
            //
            // });

            // MANHUNT.engine.init();
            // Studio.tabHandler = new Tab(jQuery('#studio-tab-list'), jQuery('#studio-tab-content'));
            //
            // if (Studio.config.getGames().length === 0){
            //     return MANHUNT.frontend.modal.handler.show('setup', Studio.onGamePathsKnown);
            // }
            //
            // Studio.onGamePathsKnown();

        });
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
