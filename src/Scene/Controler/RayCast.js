import WebGL from "../../WebGL.js";
import StudioScene from "../StudioScene.js";
import {Raycaster, Vector2} from "../../Vendor/three.module.js";

export default class RayCast{

    constructor(){
        let _this = this;
        WebGL.renderer.domElement.addEventListener( 'click', function (event) {
            _this.onClick(event);
        }, true );
    }

    onClick( event ) {

        // if (MANHUNT.control.active() === "transform") return;

        let studioSceneInfo = StudioScene.getStudioSceneInfo();
        var camera = studioSceneInfo.camera;
        var domElement = WebGL.renderer.domElement;
        var scene = studioSceneInfo.scene;

        var _raycaster = new Raycaster();
        _raycaster.layers.enableAll();
        var _mouse = new Vector2();

        var rect = domElement.getBoundingClientRect();

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, camera );

        //we want only game object, no helpers
        let childs = [];
        scene.children.forEach(function (child) {
            if (child.type === "Group")
                childs.push(child);
        });

        //we need recursive flag because the Group has the position and the children was clicked :/
        var intersects = _raycaster.intersectObjects( childs, true );

        if (intersects.length === 1){
            studioSceneInfo.control.setObject(intersects[0].object.parent);
            studioSceneInfo.control.setMode('transform');
        }
    }
}