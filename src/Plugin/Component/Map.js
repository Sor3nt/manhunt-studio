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

        this.studioScene = new SceneMap(props.entry, WebGL.renderer.domElement);

        let mesh = MeshHelper.convertFromNormalized(props.entry.data(), props.entry);
        // mesh.rotation.y = 270 * (Math.PI / 180); // convert vertical fov to radians


        //we try to set the original player position
        // if (props.entry.gameId > -1){
            let playerInst = Storage.findOneBy({
                gameId: props.entry.gameId,
                level: props.entry.level,
                type: Studio.INST,
                name: 'player'
            });

            if (playerInst !== null){
                playerInst = playerInst.data();
                this.studioScene.sceneInfo.control.playerCollider.end.set(playerInst.position.x, playerInst.position.y + 2, playerInst.position.z);

                this.studioScene.sceneInfo.camera.position.set(playerInst.position.x, playerInst.position.y + 2, playerInst.position.z);
            }

        // }
        this.studioScene.display(mesh);

        StudioScene.changeScene(this.studioScene.name);
    }


    onFocus(){

        jQuery("#info").show();

        if (this.studioScene !== null)
            StudioScene.changeScene(this.studioScene.name);


    }

    onBlur(){

        jQuery("#info").hide();

    }
}