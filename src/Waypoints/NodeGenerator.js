import {MathUtils, Raycaster, Vector3} from "../Vendor/three.module.js";
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
    generatedPointsCache = {};

    /**
     *
     * @type {Vector3[]}
     */
    generatedPoints = [];

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

        let _this = this;

        this.generateFromPosition(props.position, props.position);
        //
        //
        // let points = [];
        // this.generatedPoints.forEach(function (pointA, indexA) {
        //     let toNear = false;
        //     _this.generatedPoints.forEach(function (pointB, indexB) {
        //         if (indexA === indexB) return;
        //
        //         if (pointA.distanceTo(pointB) < 0.5)
        //             toNear = true;
        //     });
        //
        //     if (toNear === false)
        //         points.push(pointA)
        // });
        //

        this.generatedPoints.forEach(function (position) {

            // let adjustedPosition = position.clone();
            // _this.adjustPosition(adjustedPosition);

            let areaLocation = new Result(
                Studio.AREA_LOCATION,
                `node_${MathUtils.generateUUID()}`,
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

            _this.area.addNode(node);

            _this.scene.add(node.getMesh());
            _this.game.addToStorage(areaLocation);
        });

        this.callback(this.nextNodeId, this.children);
    }

    // tmpBreak = 0;

    generateFromPosition(initPosition, position){
        // this.tmpBreak++;
        // if (this.tmpBreak > 500)
        //     return;

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
            let range = 1.0;

            for(let i = 1; i <= boxes; i++){

                //give some space to next mesh
                // if (nearBy[side] < range) {
                //     if (side === "left") newPos.z -= nearBy[side] - range;
                //     if (side === "right") newPos.z += nearBy[side] - range;
                //     if (side === "front") newPos.x += nearBy[side] - range;
                //     if (side === "back") newPos.x -= nearBy[side] - range;
                // }else{
                    if (side === "left" ) newPos.z = ogPos.z - (i * 2);
                    if (side === "right") newPos.z = ogPos.z + (i * 2);
                    if (side === "front") newPos.x = ogPos.x + (i * 2);
                    if (side === "back" ) newPos.x = ogPos.x - (i * 2);

                // }

                //
                //
                // if (ogPos.x.toFixed(2) + '_' + ogPos.z.toFixed(2) === newPos.x.toFixed(2) + '_' + newPos.z.toFixed(2))
                //     continue;

                let distBottom = _this.getDistanceToBottomMesh(newPos);
                if (distBottom === false) return; //bottom found

                //its going down, stop here
                if (distBottom.distance > 2.5) return;
                if (distBottom.distance < 0.2) return;
                newPos.y = distBottom.point.y;

                // newPos.y -= distBottom;
                newPos.y += 0.5 ;

                //avoid to duplicate the start point
                if (initPosition.distanceTo(newPos) < 0.5)
                    continue;

                let posString = 'pos_' + newPos.x.toFixed(2) + '_' + newPos.y.toFixed(2) + '_'  + newPos.z.toFixed(2);

                if (_this.generatedPointsCache[posString] === true)
                    continue;



                _this.generatedPointsCache[posString] = true;
                _this.generatedPoints.push(newPos.clone());

                newPoints.push(newPos.clone());
            }
        });

        //
        newPoints.forEach(function (pos) {
            _this.generateFromPosition(initPosition, pos);
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

        if (collisionResults.length === 0) return false;

        return collisionResults[0];
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

}
