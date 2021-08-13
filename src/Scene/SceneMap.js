import {SpotLight, GridHelper, PerspectiveCamera, HemisphereLight} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";
import Studio from "../Studio.js";
import Storage from "../Storage.js";
import Walk from "./Controler/Walk.js";
import Event from "../Event.js";

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
     */
    constructor(entry, canvas) {
        super(entry.name, canvas);

        let _this = this;
        this.mapEntry = entry;

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




    #setup(){

        let sceneInfo = this.sceneInfo;
        // sceneInfo.camera.position.set(-140.83501492578623, 119.29015658522931, -73.34957947924103);


        let entities = Storage.findBy({
            type: Studio.ENTITY,
            level: this.mapEntry.level,
            gameId: this.mapEntry.gameId
        });

        entities.forEach(function (entity) {
            let mesh = entity.data().getMesh();

            if (mesh !== false){
                mesh.name = entity.name;
                mesh.userData.entity = entity;
                entity.mesh = mesh;
                sceneInfo.scene.add(mesh);
            }
        });

    }

    /**
     *
     * @param map {Group}
     */
    display( map ){
        this.sceneInfo.scene.add(map);
    }

}