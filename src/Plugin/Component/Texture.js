import AbstractComponent from "./Abstract.js";
import SceneTexture from "../../Scene/SceneTexture.js";
import StudioScene from "../../Scene/StudioScene.js";
import WebGL from "../../WebGL.js";

export default class Texture extends AbstractComponent{
    name = "Texture";
    element = jQuery('<div>');

    /**
     * @type {SceneTexture}
     */
    studioScene = null;

    /**
     * @param props {{entry: Result}}
     */
    constructor(props) {
        super(props);

        this.name = props.entry.name;

        this.studioScene = new SceneTexture(props.entry.name, WebGL.renderer.domElement);
        // this.studioScene.name = props.entry.name;
        this.studioScene.display(props.entry.getData().createThreeTexture());

        StudioScene.changeScene(this.studioScene.name);
    }


}