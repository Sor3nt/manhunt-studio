import {Vector3, SpotLight, GridHelper, PerspectiveCamera, HemisphereLight} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";
import Studio from "../Studio.js";
import Storage from "../Storage.js";
import Walk from "./Controler/Walk.js";
import Event from "../Event.js";
import Status from "../Status.js";

export default class SceneMap extends SceneAbstract{

    /**
     *
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;

    /**
     * @type {Result}
     */
    mapEntry;

    /**
     *
     * @param entry {Result}
     * @param canvas {jQuery}
     * @param mapComponent {Map}
     */
    constructor(entry, canvas, mapComponent) {
        super(entry.name, canvas);

        let _this = this;
        this.mapEntry = entry;
        this.mapComponent = mapComponent;
        this.entitiesToProcess = [];
        this.entitiesProcess = 0;

        this.sceneInfo = StudioScene.createSceneInfo(
            canvas,
            this.name,
            new PerspectiveCamera(Studio.FOV, 1.33, 0.1, 1000),
            Walk,
            function(){

            }
        );

        Event.on(Event.MAP_ENTITIES_LOADED, function (props) {
            if (_this.mapEntry !== props.entry) return;
            _this.#setup();
        });

    }


    loadNearByEntities(){


        let len = this.entitiesToProcess.length;
        if (len === 0) return false;

        let processEntries = 15;
        for(let i = 0; i < processEntries; i++){
            let entity = this.entitiesToProcess.shift();
            let mesh = entity.data().getMesh();

            if (mesh !== false){
                mesh.name = entity.name;
                mesh.userData.entity = entity;
                entity.mesh = mesh;
                this.sceneInfo.scene.add(mesh);
                this.entitiesProcess++;
            }

            if (len - i - 1 === 0){

                StudioScene.changeScene(this.mapComponent.studioScene.name);

                Status.hide();

                return;
            }
        }

        let _this = this;
        requestAnimationFrame(function () {
            _this.loadNearByEntities();
        });

    }


    #setup(){

        this.entitiesToProcess = Storage.findBy({
            type: Studio.ENTITY,
            level: this.mapEntry.level,
            gameId: this.mapEntry.gameId
        });

        this.loadNearByEntities();
    }

    /**
     *
     * @param map {Group}
     */
    display( map ){
        this.sceneInfo.scene.add(map);
    }

}