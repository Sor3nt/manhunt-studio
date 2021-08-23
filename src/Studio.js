import Loader from "./Plugin/Loader.js";
import Components from "./Plugin/Components.js";
import Layout from "./Layout.js";
import WebGL from "./WebGL.js";
import Status from "./Status.js";
import Save from "./Save.js";
import Menu from "./Menu.js";
import {OBJExporter} from "./Vendor/OBJExporter.js";
import StudioScene from "./Scene/StudioScene.js";

export default class Studio{


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

    static registerPlugins(){
        Loader.registerPlugins();
        Components.registerSections();
    }

    static boot() {

        Status.element = jQuery('#status');
        WebGL.boot();
        Studio.registerPlugins();

        Studio.createMenu();
        new Save();


        Layout.createDefaultLayout();

        WebGL.render();

        Status.hide();
        Status.showWelcome();

    }

    static createMenu(){

        Menu.create();
        Menu.addCategory('File');
        Menu.addEntry('File', 'Save', function () {
            Save.save();
        });
        Menu.addEntry('File', 'Export (experimental)', function () {
            let exporter = new OBJExporter();
            const result = exporter.parse( StudioScene.getStudioSceneInfo().scene );

            let blob = new Blob( [ result ], { type: 'application/octet-stream' } );

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "export.obj";
            link.click();
            link.remove();

            console.log(result);
        });


    }

}
