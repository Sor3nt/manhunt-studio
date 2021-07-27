import {
    EventDispatcher,
    Quaternion,
    Vector3
} from "./../../Vendor/three.module.js";
import WebGL from "../../WebGL.js";
import {FlyControls} from "../../Vendor/FlyControls.js";
import {OrbitControls} from "../Controls/OrbitControls.js";
import {TransformControls} from "../Controls/TransformControls.js";

export default class Fly{

    /**
     *
     * @param sceneInfo {StudioSceneInfo}
     */
    constructor(sceneInfo) {
        this.mode = "fly";
        this.sceneInfo = sceneInfo;
        this.object = null;
        //
        this.fly = new FlyControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.fly.movementSpeed = 80;
        this.fly.rollSpeed = Math.PI / 8;
        this.fly.autoForward = false;
        this.fly.dragToLook = false;

        this.orbit = new OrbitControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.orbit.enableDamping = true;
        this.orbit.dampingFactor = 0.05;
        this.orbit.screenSpacePanning = false;
        this.orbit.minDistance = 0.5;
        this.orbit.maxDistance = 40.0 ;
        this.orbit.maxPolarAngle = Math.PI / 2;
        this.orbit.target.set(0, 0, 0);
        this.orbit.enabled = true;


        let _this = this;
        this.transform = new TransformControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.transform.addEventListener('dragging-changed', function (event) {
            _this.orbit.enabled = !event.value;
        });
        sceneInfo.scene.add(this.transform);


    }


    update( delta ){
        if (this.mode === "fly")
            this.fly.update(delta);
        else if (this.mode === "orbit")
            this.orbit.update(delta);
        else if (this.mode === "transform" && this.object !== null){


            this.orbit.update(delta);

        }
    }

    setObject(object){
        console.log("SETT", object);
        this.object = object;

        let relativeCameraOffset = new Vector3(0, 2, -3);
        object.updateMatrixWorld();
        let cameraOffset = relativeCameraOffset.applyMatrix4(object.matrixWorld);

        this.sceneInfo.camera.position.lerp(cameraOffset, 0.1);
        this.sceneInfo.camera.lookAt(object.position);
        this.orbit.target.copy(object.position);

        this.transform.attach( object );

    }

    setMode (mode) {
        this.mode = mode;
    }
}
