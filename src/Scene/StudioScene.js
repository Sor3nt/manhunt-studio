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
     * @param onRender {function}
     * @returns {StudioSceneInfo}
     */
    static createSceneInfo(element, name, camera, onRender){

        let info = new StudioSceneInfo({
            name: name,
            onRender: onRender,
            camera: camera,
            element: element
        });

        StudioScene.sceneInfos[name] = info;

        return info;
    }

    /**
     *
     * @param name {string}
     * @returns {StudioSceneInfo}
     */
    static getStudioSceneInfo (name) {
        if (name === undefined)
            return StudioScene.activeSceneInfo;

        return StudioScene.sceneInfos[name];
    }

    static changeScene(name){
        console.log("change scene to",name);
        StudioScene.activeSceneInfo = StudioScene.getStudioSceneInfo(name);
        WebGL.resize();
    }

}