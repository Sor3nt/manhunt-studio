import {Scene as ThreeScene, Camera } from "./../Vendor/three.module.js";

export default class StudioSceneInfo{

    lookAt = null;

    /**
     *
     * @param props { {name: string, onRender: function, camera: Camera, control: function, element: jQuery} }
     */
    constructor(props) {
        this.name = props.name;
        /**
         * @type {Scene}
         */
        this.scene = new ThreeScene();
        let _this = this;

        this.camera = props.camera;
        this.element = props.element;

        this.control = props.control === null ? null : new props.control(this);


        this.onRender = function (delta) {
            if (_this.control !== null)
                _this.control.update(delta);

            props.onRender(delta);
        };
    }

}