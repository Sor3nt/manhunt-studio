import {Scene as ThreeScene, Camera } from "./../Vendor/three.module.js";

export default class StudioSceneInfo{

    lookAt = null;

    /**
     *
     * @param props { {name: string, onRender: function, camera: Camera, element: jQuery} }
     */
    constructor(props) {
        this.name = props.name;
        this.scene = new ThreeScene();
        this.control = new ThreeScene();

        this.onRender = props.onRender;
        this.camera = props.camera;
        this.element = props.element;
    }

}