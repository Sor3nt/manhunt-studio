import {AnimationClip, Scene as ThreeScene, Camera } from "./../Vendor/three.module.js";
import Animations from "../Animations.js";
import Games from "../Plugin/Games.js";

export default class StudioSceneInfo{

    /**
     * @type {Result}
     */
    lookAt = null;

    /**
     * @type {Animations}
     */
    animations = null;

    /**
     * @type SceneAbstract {null}
     */
    studioScene = null;

    /**
     *
     * @type {Scene}
     */
    scene = null;


    /**
     *
     * @param props { {name: string, onRender: function, camera: Camera, control: function, element: jQuery} }
     */
    constructor(props) {
        this.name = props.name;

        this.scene = new ThreeScene();
        let _this = this;

        this.studioScene = props.studioScene;
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
        let animationGame = Games.getGame(animEntry.gameId);
        let modelGame = Games.getGame(this.lookAt.gameId);

        console.log(this.lookAt, modelGame);

        animEntry.props.game = animationGame.game;
        if (animationGame.game !== modelGame.game)
            animEntry.props.convert = true;

        let clip = AnimationClip.parse( animEntry.data() );

        this.animations.play(this.lookAt.mesh.children[0], clip);

    }

}