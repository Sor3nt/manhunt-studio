import {SkinnedMesh, SpotLight, SkeletonHelper, GridHelper, Mesh,MeshStandardMaterial,PerspectiveCamera, HemisphereLight, CubeGeometry} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";
import Studio from "../Studio.js";
import {FlyControls} from "./Controler/FlyControls.js";

export default class SceneMap extends SceneAbstract{


    /**
     *
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;

    constructor(name, canvas) {
        super(name, canvas);

        this.sceneInfo = StudioScene.createSceneInfo(
            canvas,
            this.name,
            new PerspectiveCamera(Studio.FOV, 1.33, 0.1, 1000),
            FlyControls,
            function(){

            }
        );

        this.sceneInfo.control.movementSpeed = 50;
        // this.sceneInfo.control.fly.domElement = renderer.domElement;
        this.sceneInfo.control.rollSpeed = Math.PI / 4;
        this.sceneInfo.control.autoForward = false;
        this.sceneInfo.control.dragToLook = true;


        //todo renderOnlyOnce
        this.#setup();
    }

    #setup(){

        this.sceneInfo.camera.position.set(-140.83501492578623, 119.29015658522931, -73.34957947924103);

        let spotLight = new SpotLight(0xffffff);
        spotLight.position.set(1, 1, 1);
        this.sceneInfo.scene.add(spotLight);

        this.sceneInfo.scene.add(new HemisphereLight(0xffffff, 0x444444));
        this.sceneInfo.scene.add(new GridHelper(1000, 10, 0x888888, 0x444444));

    }

    /**
     *
     * @param model {Group}
     */
    display( model ){
// console.log(model);
        this.sceneInfo.scene.add(model);

        if (model.children[0] instanceof SkinnedMesh){
            const helper = new SkeletonHelper( model );
            this.sceneInfo.scene.add( helper );
        }
    }

}