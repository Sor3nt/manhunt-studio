import Mouse from "../Mouse.js";
import Node from "./Node.js";
import {BoxGeometry, Group, Mesh, MeshBasicMaterial, Raycaster, Vector2} from "../Vendor/three.module.js";

export default class StopperPlacing{


    /**
     * 
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;
    
    /**
     * 
     * @type {Node}
     */
    mesh = null;

    /**
     * 
     * @type {Raycaster}
     */
    raycaster = new Raycaster();

    pointer = new Vector2(0, 0);

    binding = {
        mouseClick: null,
        mouseMove: null,
    };

    /**
     *
     * @type {function|null}
     */
    onPlaceCallback = null;


    /**
     *
     * @param props {{sceneInfo: StudioSceneInfo, nextNodeId: int, areaName: string, onPlaceCallback: function}}
     */
    constructor(props){
        this.sceneInfo = props.sceneInfo;
        this.onPlaceCallback = props.onPlaceCallback;

        this.sceneInfo.scene.add(this.getMesh());

        this.binding.mouseClick = this.onMouseClick.bind(this);
        this.binding.mouseMove = this.onMouseMove.bind(this);

        Mouse.onMouseMove(this.binding.mouseMove);

        /**
         * We need to delay the registration a little bit
         * Otherwise we receive the Click-Event from the Menu-Interaction
         */
        let _this = this;
        setTimeout(function () {
            Mouse.onMouseClick(_this.binding.mouseClick);
        }, 500);
    }

    onMouseClick(){
        Mouse.removeOnMouseClick(this.binding.mouseClick);
        Mouse.removeOnMouseMove(this.binding.mouseMove);

        /**
         *
         * @type {Walk}
         */
        let control = this.sceneInfo.control;
        control.setObject(this.mesh);
        control.setMode('transform');
        control.transform.setMode('scale');

        this.onPlaceCallback(this.mesh);
    }


    onMouseMove(){
        this.raycaster.setFromCamera( this.pointer, this.sceneInfo.camera );

        const intersects = this.raycaster.intersectObjects( this.sceneInfo.scene.children[1].children );

        if ( intersects.length > 0 ) {
            
            // let nodeMesh = this.mesh;

            this.mesh.position.set( 0, 0, 0 );
            // this.mesh.lookAt( intersects[ 0 ].face.normal );

            this.mesh.position.copy( intersects[ 0 ].point );
            this.mesh.position.y += 0.5;
        }
    }


    /**
     *
     * @returns {Group}
     */
    getMesh(){
        if (this.mesh !== null)
            return this.mesh;

        const geometry = new BoxGeometry(2.0, 1.0, 0.25);
        const material = new MeshBasicMaterial({color: 0x00ff00});
        material.opacity = 0.5;
        material.transparent = true;

        const cube = new Mesh(geometry, material);
        cube.name = this.name;

        let group = new Group();
        group.add(cube);

        this.mesh = group;

        return this.mesh;
    }



}
