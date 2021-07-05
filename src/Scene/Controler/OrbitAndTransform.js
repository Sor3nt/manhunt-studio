import {OrbitControls} from "./../Controls/OrbitControls.js";
import {TransformControls} from "./../Controls/TransformControls.js";
import WebGL from "./../../WebGL.js";

export default class OrbitAndTransform{

    /**
     *
     * @param sceneInfo {StudioSceneInfo}
     */
    constructor(sceneInfo) {

        this.orbit = new OrbitControls( sceneInfo.camera, WebGL.renderer.domElement );
        this.orbit.enableDamping = true;
        this.orbit.dampingFactor = 0.05;
        this.orbit.screenSpacePanning = false;
        this.orbit.minDistance = 0.5 ;
        // self._control.orbit.maxDistance = 40.0 ;
        this.orbit.maxPolarAngle = Math.PI / 2;
        this.orbit.target.set(0,0,0);
        this.orbit.enabled = true;


        let _this = this;
        this.transform = new TransformControls( sceneInfo.camera, WebGL.renderer.domElement );
        this.transform.addEventListener( 'dragging-changed', function ( event ) {
            _this.orbit.enabled = ! event.value;
        } );
        sceneInfo.scene.add( this.transform );

    }

    update( ){
        this.orbit.update();
    }

}

