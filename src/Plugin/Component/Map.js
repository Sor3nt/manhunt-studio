import AbstractComponent from "./Abstract.js";
import SceneMap from "../../Scene/SceneMap.js";
import StudioScene from "../../Scene/StudioScene.js";
import WebGL from "../../WebGL.js";
import Studio from "../../Studio.js";
import Storage from "../../Storage.js";
import MeshHelper from "../../MeshHelper.js";
import Status from "../../Status.js";

export default class Map extends AbstractComponent{
    name = "map";
    displayName = "Map";
    element = jQuery('<div>');

    /**
     * @type {SceneMap}
     */
    studioScene = null;

    /**
     * @param props {{entry: Result}}
     */
    constructor(props) {
        super(props);

        this.name = props.entry.name;

        this.studioScene = new SceneMap(props.entry.name, WebGL.renderer.domElement);

        //we try to set the original player position
        if (props.entry.gameId > -1){
            let playerInst = Storage.findOneBy({
                gameId: props.entry.gameId,
                type: Studio.INST,
                name: 'player'
            }).data();

            this.studioScene.sceneInfo.camera.position.set(playerInst.position.x, playerInst.position.y, playerInst.position.z);
        }


        let mesh = MeshHelper.convertFromNormalized(props.entry);
        this.studioScene.display(mesh);

        StudioScene.changeScene(this.studioScene.name);
    }


}