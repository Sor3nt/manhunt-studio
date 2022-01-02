import Mouse from "../Mouse.js";
import {Raycaster, Vector2} from "../Vendor/three.module.js";
import WebGL from "../WebGL.js";

export default class RouteSelection{

    /**
     * @type {Waypoints}
     */
    waypoints = null;

    /**
     * @type {Raycaster}
     */
    raycaster = new Raycaster();

    pointer = new Vector2(0, 0);

    binding = {
        mouseClick: null
    };

    /**
     *
     * @type {function|null}
     */
    onPlaceCallback = null;

    /**
     *
     * @type {StudioSceneInfo|null}
     */
    sceneInfo = null;


    /**
     *
     * @type {Group[]}
     */
    meshes = [];


    /**
     *
     * @type {Node}
     */
    firstNode = null;


    /**
     *
     * @type {Route}
     */
    route = null;


    /**
     *
     * @param props {{waypoints: Waypoints, route: Route, sceneInfo: StudioSceneInfo,  onPlaceCallback: function}}
     */
    constructor(props){
        this.route = props.route;
        this.sceneInfo = props.sceneInfo;
        this.waypoints = props.waypoints;
        this.onPlaceCallback = props.onPlaceCallback;

        this.binding.mouseClick = this.onMouseClick.bind(this);

        let _this = this;
        this.waypoints.children.forEach(function (area) {
            area.children.forEach(function (node) {
                _this.meshes.push(node.getMesh().children[0]);

            });
        });
        console.log("googog");

        /**
         * We need to delay the registration a little bit
         * Otherwise we receive the Click-Event from the Menu-Interaction
         */
        setTimeout(function () {
            Mouse.onMouseClick(_this.binding.mouseClick);
        }, 500);
    }

    hackGetNodeByMesh(mesh){
        let _this = this;
        let found = false;
        this.waypoints.children.forEach(function (area) {
            area.children.forEach(function (node) {
console.log(node.getMesh().children[0], mesh);
                if (node.getMesh().children[0] === mesh)
                    found = node;

            });
        });

        return found;

    }

    onMouseClick(event){
        let domElement = WebGL.renderer.domElement;
        let rect = domElement.getBoundingClientRect();
        // Mouse.removeOnMouseClick(this.binding.mouseClick);

        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.sceneInfo.camera);

        let intersects = this.raycaster.intersectObjects(this.meshes, true);

        if (intersects.length === 1){
            let nodeMesh = intersects[0].object;

            if (this.firstNode === null) {
                this.firstNode = this.hackGetNodeByMesh(nodeMesh);
                console.log(this.firstNode);
            }else{

                let node = this.hackGetNodeByMesh(nodeMesh);
                if (this.firstNode === node)
                    return;

                this.route.addNode(this.firstNode);

                this.firstNode = node;

            }

        }

    }



}
