import {SpotLight, GridHelper, PerspectiveCamera, HemisphereLight} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";
import Studio from "../Studio.js";
import Storage from "../Storage.js";
import Walk from "./Controler/Walk.js";

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

        this.mapEntry = entry;

        this.sceneInfo = StudioScene.createSceneInfo(
            canvas,
            this.name,
            new PerspectiveCamera(Studio.FOV, 1.33, 0.1, 1000),
            Walk,
            function(){

            }
        );
        //
        // this.sceneInfo.control.movementSpeed = 50;
        // this.sceneInfo.control.rollSpeed = Math.PI / 4;
        // this.sceneInfo.control.autoForward = false;
        // this.sceneInfo.control.dragToLook = true;

        this.#setup();
    }




    #setup(){

        let sceneInfo = this.sceneInfo;
        sceneInfo.camera.position.set(-140.83501492578623, 119.29015658522931, -73.34957947924103);

        let spotLight = new SpotLight(0xffffff);
        spotLight.position.set(1, 1, 1);
        sceneInfo.scene.add(spotLight);

        sceneInfo.scene.add(new HemisphereLight(0xffffff, 0x444444));
        sceneInfo.scene.add(new GridHelper(1000, 10, 0x888888, 0x444444));

        let entities = Storage.findBy({
            type: Studio.ENTITY,
            gameId: this.mapEntry.gameId
        });

        entities.forEach(function (entity) {
            let mesh = entity.data().getMesh();

            if (mesh !== false){
                mesh.name = entity.name,
                mesh.userData.entity = entity;
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