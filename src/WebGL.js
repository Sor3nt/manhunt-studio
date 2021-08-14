import {Clock, WebGLRenderer} from "./Vendor/three.module.js";
import StudioScene from "./Scene/StudioScene.js";
import {EffectComposer} from "./Vendor/EffectComposer.js";
import {FXAAShader} from "./Vendor/FXAAShader.js";
import Studio from "./Studio.js";
import {ShaderPass} from "./Vendor/ShaderPass.js";


export default class WebGL{

    /** @type {HTMLElement} */
    static container;

    /** @type {WebGLRenderer} */
    static renderer;

    /** @type {Clock} */
    static clock;

    /** @type {EffectComposer} */
    static composer;

    /** @type {ShaderPass} */
    static effectFXAA;

    static boot(){
        WebGL.container = document.getElementById('webgl');
        WebGL.renderer = new WebGLRenderer({antialias: false, alpha: true});
        WebGL.clock = new Clock();

        if (Studio.settings.outlineActiveObject){
            WebGL.composer = new EffectComposer( WebGL.renderer );
            WebGL.effectFXAA = new ShaderPass( FXAAShader );
        }

        WebGL.container.appendChild(WebGL.renderer.domElement);
        window.addEventListener('resize', WebGL.resize, false);
        WebGL.resize();
    }

    static resize(){
        let sceneInfo = StudioScene.getStudioSceneInfo(undefined);
        if (sceneInfo === null) return;

        let bbox = sceneInfo.element.parentNode.getBoundingClientRect();
        sceneInfo.camera.aspect = bbox.width / bbox.height;
        sceneInfo.camera.updateProjectionMatrix();

        if (Studio.settings.outlineActiveObject){
            WebGL.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / bbox.width, 1 / bbox.height );
            WebGL.composer.setSize( bbox.width, bbox.height );
        }

        WebGL.renderer.setSize(bbox.width, bbox.height);
    }

    static render() {

        //limit fps to 60fps for performance increase
        setTimeout( function() {
            requestAnimationFrame( WebGL.render );
        }, 1000 / 60 );

        /**  @type {StudioSceneInfo} */
        let sceneInfo = StudioScene.activeSceneInfo;
        if (sceneInfo === null) return;

        sceneInfo.onRender(WebGL.clock.getDelta());
        WebGL.renderer.render(sceneInfo.scene, sceneInfo.camera);

        if (Studio.settings.outlineActiveObject)
            WebGL.composer.render();
    }
}
