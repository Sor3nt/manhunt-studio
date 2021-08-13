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

        this.studioScene = new SceneMap(props.entry, WebGL.renderer.domElement, this);

        let mesh = MeshHelper.convertFromNormalized(props.entry.data(), props.entry);
        // mesh.rotation.y = 270 * (Math.PI / 180); // convert vertical fov to radians


        let gameInfo = Studio.config.getGame(props.entry.gameId);

        //we try to set the original player position
        // if (props.entry.gameId > -1){
            let playerInst = Storage.findOneBy({
                gameId: props.entry.gameId,
                level: props.entry.level,
                type: Studio.INST,
                name: gameInfo.game === "mh2" ? 'player(player)' : 'player'
            });

            if (playerInst !== null){
                playerInst = playerInst.data();
                this.studioScene.sceneInfo.control.playerCollider.end.set(playerInst.position.x, playerInst.position.y + 2, playerInst.position.z);

                this.studioScene.sceneInfo.camera.position.set(playerInst.position.x, playerInst.position.y + 2, playerInst.position.z);
            }

        // }
        this.studioScene.display(mesh);

    }


    onFocus(){
        //
        // window.setTimeout(function () {
        //     document.body.requestPointerLock();
        // }, 100);

        // Status.showInfo('world');

        if (
            this.studioScene !== null &&

            //Note: The initial loading process should not render stuff
            //      changeScene would force the rendering but we want that trigger right after anything is loaded (SceneMap.js)
            (
                this.studioScene.entitiesToProcess.length === 0 &&
                this.studioScene.entitiesProcess > 0
            )
        ){
            StudioScene.changeScene(this.studioScene.name);
        }


    }

    onBlur(){

        Status.hideInfo();

    }
}