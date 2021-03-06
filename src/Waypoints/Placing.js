import Mouse from "../Mouse.js";
import Result from "../Plugin/Loader/Result.js";
import Studio from "../Studio.js";
import Node from "./Node.js";
import {MathUtils, Raycaster, Vector2, Vector3} from "../Vendor/three.module.js";

export default class Placing{


    /**
     * 
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;
    
    /**
     * 
     * @type {Node}
     */
    node = null;

    /**
     * 
     * @type {Raycaster}
     */
    raycaster = new Raycaster();

    pointer = new Vector2(0, 0);

    binding = {
        mouseClick: null,
        mouseMove: null,
        keyUpEsc: null
    };

    nextNodeId = 0;

    /**
     *
     * @type {string}
     */
    areaName = "";

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
        this.nextNodeId = props.nextNodeId;
        this.areaName = props.areaName;
        this.onPlaceCallback = props.onPlaceCallback;
        this.createNode();

        this.binding.mouseClick = this.onMouseClick.bind(this);
        this.binding.mouseMove = this.onMouseMove.bind(this);
        this.binding.keyUpEsc = this.onKeyUpEsc.bind(this);

        Mouse.onMouseMove(this.binding.mouseMove);

        /**
         * We need to delay the registration a little bit
         * Otherwise we receive the Click-Event from the Menu-Interaction
         */
        let _this = this;
        setTimeout(function () {
            document.addEventListener('pointerlockchange', _this.binding.keyUpEsc, false);
            Mouse.onMouseClick(_this.binding.mouseClick);
        }, 500);
    }

    unbind(){
        Mouse.removeOnMouseClick(this.binding.mouseClick);
        Mouse.removeOnMouseMove(this.binding.mouseMove);
        document.removeEventListener('pointerlockchange', this.binding.keyUpEsc);
    }

    onKeyUpEsc(){
        this.unbind();
        this.sceneInfo.scene.remove(this.node.getMesh());
        this.onPlaceCallback(null);
    }

    onMouseClick(){
        if (document.pointerLockElement !== document.body)
            return this.onKeyUpEsc();

        this.unbind();

        this.node.entity.props.position = this.node.getMesh().position.clone();
        this.node.position = this.node.getMesh().position.clone();

        this.onPlaceCallback(this.node);
    }


    onMouseMove(){
        this.raycaster.setFromCamera( this.pointer, this.sceneInfo.camera );

        const intersects = this.raycaster.intersectObjects( this.sceneInfo.scene.children[1].children );

        if ( intersects.length > 0 ) {
            
            let nodeMesh = this.node.getMesh();

            nodeMesh.position.set( 0, 0, 0 );
            nodeMesh.lookAt( intersects[ 0 ].face.normal );

            nodeMesh.position.copy( intersects[ 0 ].point );
            nodeMesh.position.y += 0.5;
        }
    }


    createNode(){

        let areaLocation = new Result(
            Studio.AREA_LOCATION,
            `node_${MathUtils.generateUUID()}`,
            new ArrayBuffer(0),
            0,
            {
                id: this.nextNodeId,
                name: "",
                areaName: this.areaName,
                position: new Vector3(),
                radius: 0.5,
                nodeName: "",
                unkFlags: [],
                waypoints: [],
                // entries: [] //todo rename to "routeNodeIds"
            },
            function () {
                console.error("HMMM TODO");
                debugger;
            }
        );

        this.node = new Node(areaLocation);
        this.sceneInfo.scene.add(this.node.getMesh());
    }



}
