import AbstractComponent from "./Abstract.js";
import SceneModel from "../../Scene/SceneModel.js";
import StudioScene from "../../Scene/StudioScene.js";
import WebGL from "../../WebGL.js";
import MeshHelper from "../../MeshHelper.js";

export default class Model extends AbstractComponent{
    name = "Model";
    element = jQuery('<div>');

    /**
     * @type {SceneModel}
     */
    studioScene = null;

    /**
     * @param props {{entry: Result}}
     */
    constructor(props) {
        super(props);

        this.name = props.entry.name;

        this.studioScene = new SceneModel(props.entry.name, WebGL.renderer.domElement);

        let mesh = MeshHelper.convertFromNormalized(props.entry);
        this.studioScene.display(mesh);

        StudioScene.changeScene(this.studioScene.name);
    }


}