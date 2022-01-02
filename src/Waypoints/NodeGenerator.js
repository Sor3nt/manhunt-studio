import {Raycaster, Vector3} from "../Vendor/three.module.js";
import Result from "../Plugin/Loader/Result.js";
import Node from "./Node.js";
import Studio from "../Studio.js";

export default class NodeGenerator{

    /**
     *
     * @type {Mesh[]}
     */
    worldMeshes = [];

    /**
     *
     * @type {Node[]}
     */
    children = [];

    /**
     *
     * @type {string[]}
     */
    generatedPointsCache = [];

    /**
     *
     * @type {number}
     */
    nextNodeId = 0;

    /**
     *
     * @type {Game|null}
     */
    game = null;

    /**
     *
     * @type {function}
     */
    callback = null;


    /**
     *
     * @type {Scene|null}
     */
    scene = null;

    /**
     *
     * @type {Area|null}
     */
    area = null;

    /**
     *
     * @type {string|null}
     */
    level = null;

    /**
     *
     * @param props {{level:string, area:Area, scene: Scene, meshes: Mesh[], nextNodeId: int, game: Game, callback: function, position: Vector3}}
     */
    constructor(props){
        this.level = props.level;
        this.area = props.area;
        this.scene = props.scene;
        this.worldMeshes = props.meshes;
        this.nextNodeId = props.nextNodeId;
        this.game = props.game;
        this.callback = props.callback;

        this.generateFromPosition(props.position);
        this.generateRoutes();

        this.callback(this.nextNodeId, this.children);
    }

    generateFromPosition(position){

        let _this = this;
        let ogPos = position.clone();
        let newPoints = [];
        let nearBy = this.getDistanceToMesh(position);

        ['left', 'right', 'front', 'back'].forEach(function (side) {
            if (nearBy[side] === false) return;
            if (nearBy[side] <= 2) return;

            let boxes = nearBy[side] / 2;
            if (boxes < 1) return;
            if (boxes > 500){
                console.error('too many boxes on one row ?! ' + boxes);
                return;
            }

            let newPos = ogPos.clone();

            for(let i = 0; i <= boxes; i++){

                if (side === "left" ) newPos.z = ogPos.z - (i * 2);
                if (side === "right") newPos.z = ogPos.z + (i * 2);
                if (side === "front") newPos.x = ogPos.x + (i * 2);
                if (side === "back" ) newPos.x = ogPos.x - (i * 2);

                //its going down, stop here
                if (_this.getDistanceToBottomMesh(newPos) > 1.5) continue;

                if (ogPos.x + '_' + ogPos.y + '_' + ogPos.z === newPos.x + '_' + newPos.y + '_' + newPos.z)
                    continue;

                let posString = newPos.x + '_' + newPos.y + '_' + newPos.z;

                if (_this.generatedPointsCache.indexOf(posString) !== -1)
                    continue;

                _this.generatedPointsCache.push(posString);

                newPoints.push(newPos.clone());
            }
        });


        newPoints.forEach(function (position) {

            let areaLocation = new Result(
                Studio.AREA_LOCATION,
                '',
                new ArrayBuffer(0),
                0,
                {
                    id: _this.nextNodeId,
                    areaName: _this.area.name,
                    position: position,
                    radius: 0.5,
                    name: "",
                    nodeName: "",
                    unkFlags: [],
                    waypoints: []
                },
                function () {
                    console.error("HMMM TODO");
                    debugger;
                }
            );

            areaLocation.level = _this.level;


            _this.nextNodeId++;
            let node = new Node(areaLocation);
            _this.children.push(node);

            //take sure we do not clip inside a wall
            let adjusted = node.position.clone();
            _this.adjustPosition(adjusted);
            node.getMesh().position.copy(adjusted);
            node.position = adjusted;
            areaLocation.props.position = adjusted;

            _this.area.addNode(node);

            _this.scene.add(node.getMesh());
            _this.game.addToStorage(areaLocation);
        });

        newPoints.forEach(function (pos) {
            _this.generateFromPosition(pos);
        });
    }

    /**
     * Take sure the have enough space to nearby meshes
     *
     * @param position {Vector3}
     */
    adjustPosition(position){
        let nearBy = this.getDistanceToMesh(position);
        let range = 1.0;

        ['left', 'right', 'front', 'back'].forEach(function (side) {
            if (nearBy[side] < range){
                if (side === "left" ) position.z -= nearBy[side] - range;
                if (side === "right") position.z += nearBy[side] - range;
                if (side === "front") position.x += nearBy[side] - range;
                if (side === "back" ) position.x -= nearBy[side] - range;

            }
        });
    }

    getDistanceToBottomMesh(position){
        let ray = new Raycaster( position.clone(), new Vector3(0,-1, 0) );
        let collisionResults = ray.intersectObjects( this.worldMeshes );

        if (collisionResults.length === 0) return 0.5;

        return collisionResults[0].distance;
    }


    /**
     *
     * @param vec3 {Vector3}
     * @returns {{left: (boolean|double), back: (boolean|double), right: (boolean|double), front: (boolean|double)}}
     */
    getDistanceToMesh(vec3){

        let col1 = (new Raycaster( vec3.clone(), new Vector3(0,0, 1) )).intersectObjects( this.worldMeshes );
        let col2 = (new Raycaster( vec3.clone(), new Vector3(0,0, -1) )).intersectObjects( this.worldMeshes );
        let col3 = (new Raycaster( vec3.clone(), new Vector3(1,0, 0) )).intersectObjects( this.worldMeshes );
        let col4 = (new Raycaster( vec3.clone(), new Vector3(-1,0, 0) )).intersectObjects( this.worldMeshes );

        return {
            right: col1.length === 0 ? false : col1[0].distance,
            left: col2.length === 0 ? false : col2[0].distance,
            front: col3.length === 0 ? false : col3[0].distance,
            back: col4.length === 0 ? false : col4[0].distance
        };
    }

    generateRoutes(){

        let _this = this;

        let waypoints = this.game.findBy({
            level: this.level,
            type: Studio.AREA_LOCATION
        });

        waypoints.forEach(function (waypoint) {
            waypoint.props.waypoints = [];
        });


        waypoints.forEach(function (waypointOuter) {
            let tmpLow = 10000000;

            waypoints.forEach(function (waypointInner) {
                if (waypointInner === waypointOuter) return;

                let dist = waypointOuter.mesh.position.distanceTo(waypointInner.mesh.position);

                if (tmpLow > dist) tmpLow = dist;

                if (dist <= 3.05){

                    // let dir = new Vector3();
                    // dir.subVectors( waypointInner.mesh.position, waypointOuter.mesh.position ).normalize();
                    //
                    // let collisions = (new Raycaster( waypointOuter.mesh.position, dir )).intersectObjects( _this.worldMeshes );
                    //
                    // if (collisions.length === 0) return;
                    // if (collisions[0].distance < 1.05) return;

                    waypointOuter.props.waypoints.push({
                        linkId: waypointInner.props.id,
                        type: 3,
                        relation: []
                    });
                    //
                    // waypointInner.props.waypoints.push({
                    //     linkId: waypointOuter.props.id,
                    //     type: 3,
                    //     relation: []
                    // });
                }

            });

            console.log(waypointOuter.props.waypoints, "rel geneerated min dist", tmpLow);
        });
    }
//     generateRoutes(){
//
//         let _this = this;
//
//         //         let waypoints = this.game.findBy({
// //             type: Studio.AREA_LOCATION
// //         });
//
//         this.children.forEach(function (waypointOuter) {
//             waypointOuter.entity.props.waypoints = [];
//             _this.children.forEach(function (waypointInner) {
//                 if (waypointInner === waypointOuter) return;
//
//                 let dist = waypointOuter.getMesh().position.distanceTo(waypointInner.getMesh().position);
//                 if (dist <= 3.2){
//
//                     let dir = new Vector3();
//                     dir.subVectors( waypointInner.position, waypointOuter.position ).normalize();
//
//                     let collisions = (new Raycaster( waypointOuter.position, dir )).intersectObjects( _this.worldMeshes );
//
//                     if (collisions.length === 0) return;
//                     if (collisions[0].distance < 2.5) return;
//
//                     waypointOuter.entity.props.waypoints.push({
//                         linkId: waypointInner.id,
//                         type: 3,
//                         relation: []
//                     });
//
//                     waypointInner.entity.props.waypoints.push({
//                         linkId: waypointOuter.id,
//                         type: 3,
//                         relation: []
//                     });
//                 }
//
//             });
//         });
//     }
}
