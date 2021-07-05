import {Clock, Scene, WebGLRenderer} from "./Vendor/three.module.js";
import StudioScene from "./Scene/StudioScene.js";

export default class WebGL{

    /** @type {HTMLElement} */
    static container;

    /** @type {WebGLRenderer} */
    static renderer;

    /** @type {Clock} */
    static clock;

    static boot(){
        WebGL.container = document.getElementById('webgl');
        WebGL.renderer = new WebGLRenderer({antialias: false, alpha: true});
        WebGL.clock = new Clock();

        WebGL.container.appendChild(WebGL.renderer.domElement);
        window.addEventListener('resize', WebGL.resize, false);
        WebGL.resize();
    }

    static resize(){
        let sceneInfo = StudioScene.getStudioSceneInfo(undefined);
        if (sceneInfo === null) return;

        let bbox = sceneInfo.element.getBoundingClientRect();
        sceneInfo.camera.aspect = bbox.width / bbox.height;
        sceneInfo.camera.updateProjectionMatrix();
        WebGL.renderer.setSize(bbox.width, bbox.height);
    }

    static render() {
        requestAnimationFrame(WebGL.render);
        /**  @type {StudioSceneInfo} */
        let sceneInfo = StudioScene.activeSceneInfo;
        if (sceneInfo === null) return;

        sceneInfo.onRender(WebGL.clock.getDelta());
        WebGL.renderer.render(sceneInfo.scene, sceneInfo.camera);
    }
}
