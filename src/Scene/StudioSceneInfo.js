import {AnimationClip, Scene as ThreeScene, Camera } from "./../Vendor/three.module.js";
import Animations from "../Animations.js";
import Games from "../Plugin/Games.js";

export default class StudioSceneInfo{

    /**
     * @type {Group}
     */
    lookAt = null;

    /**
     * @type {Animations}
     */
    animations = null;

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
        this.animations = new Animations();

        this.control = props.control === null ? null : new props.control(this);


        this.onRender = function (delta) {
            if (_this.control !== null)
                _this.control.update(delta);

            _this.animations.update(delta);
            props.onRender(delta);
        };
    }

    /**
     *
     * @param animEntry {Result}
     */
    playAnimationOnActiveElement(animEntry){
        let game = Games.getGame(animEntry.gameId);
        animEntry.props.game = game.game;
        let clip = AnimationClip.parse( animEntry.data() );


        this.animations.play(this.lookAt.children[0], clip);

    }

}