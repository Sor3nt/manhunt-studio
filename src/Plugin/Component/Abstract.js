import SceneAbstract from "../../Scene/Abstract.js";
import StudioScene from "../../Scene/StudioScene.js";

export default class AbstractComponent{

    name = "Noname Component";
    displayName = "Noname Component";
    element = jQuery('<div>');

    /**
     * @type {SceneAbstract}
     */
    studioScene = null;

    /**
     *
     * @param props {{}}
     */
    constructor(props){
        this.props = props;
    }

    onFocus(){
        console.log("CHANGE SCENE", this.studioScene.name);
        StudioScene.changeScene(this.studioScene.name);

    }

}