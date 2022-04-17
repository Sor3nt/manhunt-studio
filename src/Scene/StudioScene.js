import { Camera } from "./../Vendor/three.module.js";
import StudioSceneInfo from "./StudioSceneInfo.js";
import WebGL from "../WebGL.js";

export default class StudioScene{
    /**  @type {Object} */
    static sceneInfos = {};

    /**  @type {StudioSceneInfo} */
    static activeSceneInfo = null;

    /**
     *
     * @param element {jQuery}
     * @param name {string}
     * @param camera {Camera}
     * @param control {function}
     * @param onRender {function}
     * @param studioScene {SceneAbstract}
     * @returns {StudioSceneInfo}
     */
    static createSceneInfo(element, name, camera, control, onRender, studioScene){

        let info = new StudioSceneInfo({
            name: name,
            onRender: onRender,
            camera: camera,
            control: control,
            element: element,
            studioScene: studioScene
        });

        StudioScene.sceneInfos[name] = info;

        return info;
    }

    /**
     *
     * @param name {string|undefined}
     * @returns {StudioSceneInfo}
     */
    static getStudioSceneInfo (name) {
        if (name === undefined)
            return StudioScene.activeSceneInfo;

        return StudioScene.sceneInfos[name];
    }

    static changeScene(name){



// console.log("change scene to ", name);
        StudioScene.activeSceneInfo = StudioScene.getStudioSceneInfo(name);
        WebGL.resize();
    }

}
