import SceneAbstract from "../../Scene/Abstract.js";
import StudioScene from "../../Scene/StudioScene.js";

export default class AbstractComponent{

    name = "Noname Component";
    displayName = "Noname Component";
    element = jQuery('<div>');
    /**
     * @type {jQuery}
     */
    tab;

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
        this.element.html('<div class="no-content"><div>Nothing to display</div></div>');

    }

    onBlur(){

    }

    onFocus(){
        console.debug("[Abstract] New Focus on", this.studioScene);
        if (this.studioScene !== null)
            StudioScene.changeScene(this.studioScene.name);

    }

}
