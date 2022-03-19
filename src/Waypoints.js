import Studio from "./Studio.js";
import Games from "./Plugin/Games.js";
import Node from "./Waypoints/Node.js";
import Area from "./Waypoints/Area.js";
import Route from "./Waypoints/Route.js";
import Placing from "./Waypoints/Placing.js";
import NodeGenerator from "./Waypoints/NodeGenerator.js";
import RouteSelection from "./Waypoints/RouteSelection.js";
import {Vector3, Raycaster} from "./Vendor/three.module.js";
import StopperPlacing from "./Waypoints/StopperPlacing.js";
import Result from "./Plugin/Loader/Result.js";
import {Geometry, Line, LineBasicMaterial} from "./Vendor/three.module.js";
import WebGL from "./WebGL.js";


export default class Waypoints{

    /**
     *
     * @type {SceneMap|null}
     */
    sceneMap = null;

    /**
     *
     * @type {Game|null}
     */
    game = null;

    /**
     *
     * @type {string}
     */
    level = "";

    /**
     *
     * @type {Area[]}
     */
    children = [];

    /**
     *
     * @type {Route[]}
     */
    routes = [];

    /**
     *
     * @type {{Node}}
     */
    nodeByNodeId = {};

    /**
     *
     * @type {int}
     */
    nextNodeId = -1;

    /**
     *
     * @type {Mesh[]}
     */
    meshesForRaycast = [];

    /**
     *
     * @param sceneMap {SceneMap}
     */
    constructor(sceneMap){
        this.sceneMap = sceneMap;
        this.game = Games.getGame(sceneMap.mapEntry.gameId);
        this.level = sceneMap.mapEntry.level;

        this.createAreasAndNodes();
        this.createRoutes();
        this.loadMeshesForRaycast();

    }

    loadMeshesForRaycast(){
        // if (this.meshesForRaycast.length > 0)
        //     return this.meshesForRaycast;

        let _this = this;
        let stoppers = this.game.findBy({
            type: Studio.WAYPOINT_STOPPER,
            level: this.level,
        });

        stoppers.forEach(function (stopper) {
            _this.meshesForRaycast.push(stopper.mesh.children[0]);
        });

        let entities = this.game.findBy({
            type: Studio.ENTITY,
            level: this.level,
        });

        entities.forEach(function (result) {
            if (result.mesh === null)
                return;

            //We want only real objects, no hunters or triggers...
            if (result.props.className !== "Base_Inst")
                return;

            _this.meshesForRaycast.push(result.mesh.children[0]);
        });


        //add world meshes
        this.sceneMap.sceneInfo.scene.children[1].children.forEach(function (mesh) {
            _this.meshesForRaycast.push(mesh);
        });
    }

    nodeVisible(state){
        this.children.forEach(function (area) {
            area.setNodeVisible(state);
        });
    }

    lineVisible(state){
        this.children.forEach(function (area) {
            area.setLinesVisible(state);
        });
    }


    routeVisible(state){
        this.routes.forEach(function (route) {
            route.setVisible(state);
        });
    }

    routeHighlight(state){
        this.routes.forEach(function (route) {
            route.highlight(state);
        });
    }

    /**
     *
     * @param areaName {string}
     * @returns {boolean|Area}
     */
    getAreaByName(areaName){
        let result = false;
        this.children.forEach(function (area) {
            if (area.name === areaName)
                result = area;
        });

        return result;
    }

    /**
     *
     * @param areaName {string|undefined}
     */
    clear(areaName){
        //we want to clean the whole map (all areas)
        if (areaName === undefined){
            this.children.forEach(function (area) {
                area.clear();
            });

            this.routes.forEach(function (route) {
                route.remove();
            });

            this.routes = [];

            this.nextNodeId = 0;

            this.nodeByNodeId = {};
        }else{
            let _this = this;
            let area = this.getAreaByName(areaName);

            this.routes = this.routes.filter(function (route) {
                let nodeInArea = route.isRouteNodeInArea(area);
                if (nodeInArea)
                    route.remove();

                return !nodeInArea;
            });

            area.children.forEach(function (node) {
                delete _this.nodeByNodeId[node.getId()];
            });

            area.clear();

        }

    }

    /**
     *
     * @param route {Route}
     */
    routeSelection(route){
        new RouteSelection({
            sceneInfo: this.sceneMap.sceneInfo,
            waypoints: this,
            route: route,
            onPlaceCallback: function (route) {

            }
        });
    }

    /**
     *
     * @param area {Area}
     * @param position {Vector3}
     */
    nodeGenerate(area, position){
        let _this = this;

        new NodeGenerator({
            area: area,
            scene: this.sceneMap.sceneInfo.scene,
            meshes: this.meshesForRaycast,
            nextNodeId: this.nextNodeId,
            position: position,
            game: this.game,
            level: this.level,
            callback: function (nextNodeId, nodes) {

                nodes.forEach(function (node) {
                    if (_this.nodeByNodeId[node.getId()] !== undefined)
                        console.error("Waypoint node already existent", node);

                    _this.nodeByNodeId[node.getId()] = node;
                });

                _this.nextNodeId = nextNodeId;

                _this.generateAllRelations();
                _this.createNodeRelations(area);
            }
        });
    }

    removeNodeId(id){
        if (this.nodeByNodeId[id] === undefined){
            console.error('Unable to find node Id', id);
            return;
        }

        let node = this.nodeByNodeId[id];
        let area = this.getCreateArea(node.entity.props.areaName);
        area.removeNode(node);

        delete this.nodeByNodeId[id];

    }

    placeNewNode(areaName){

        let _this = this;

        new Placing({
            sceneInfo: this.sceneMap.sceneInfo,
            nextNodeId: this.nextNodeId,
            areaName: areaName,
            onPlaceCallback: function (areaNode) {
                if (areaNode === null)
                    return;

                _this.nodeByNodeId[_this.nextNodeId] = areaNode;

                let area = _this.getCreateArea(areaName);
                area.addNode(areaNode);

                areaNode.entity.level = _this.level;
                _this.game.addToStorage(areaNode.entity);

                _this.generateNearByRelation(areaNode);
                _this.createNodeRelations(area);

                _this.nextNodeId++;

                _this.placeNewNode(areaName);

                // _this.meshesForRaycast.push(areaNode.getMesh().children[0]);

            }
        });
    }

    placeStopper(){

        let _this = this;

        new StopperPlacing({
            sceneInfo: this.sceneMap.sceneInfo,
            onPlaceCallback: function (mesh) {
                if (mesh === null)
                    return;

                let areaBlocker = new Result(
                    Studio.WAYPOINT_STOPPER,
                    'stopper',
                    new ArrayBuffer(0),
                    0,
                    {},
                    function () {
                        console.error("HMMM TODO");
                        debugger;
                    }
                );

                areaBlocker.level = _this.level;
                areaBlocker.mesh = mesh;

                _this.meshesForRaycast.push(mesh.children[0]);

                _this.game.addToStorage(areaBlocker);
            }
        });
    }

    getCreateArea(areaName){
        let found = false;
        this.children.forEach(function (area) {
            if (found !== false)
                return;

            if (area.name === areaName)
                found = area;
        });

        if (found !== false)
            return found;

        let area = new Area(areaName);
        this.children.push(area);
        return area;
    }

    createAreasAndNodes(){
        let _this = this;
        let areaNodes = this.game.findBy({
            type: Studio.AREA_LOCATION,
            level: this.level
        });

        let areaNodesByArea = {};
        areaNodes.forEach(function (areaNode) {
            if (areaNode.props.id > _this.nextNodeId){
                _this.nextNodeId = areaNode.props.id;
            }

            let areaName = areaNode.props.areaName;
            if (areaNodesByArea[areaName] === undefined)
                areaNodesByArea[areaName] = [];

            areaNodesByArea[areaName].push(areaNode);
        });

        this.nextNodeId++;

        for(let areaName in areaNodesByArea){
            if (!areaNodesByArea.hasOwnProperty(areaName)) continue;

            let areaNodes = areaNodesByArea[areaName];

            let area = new Area(areaName);
            /**
             * Create each Node for this area and append it to the Map
             */
            areaNodes.forEach(function (areaNode) {
                let node = new Node(areaNode);

                _this.nodeByNodeId[areaNode.props.id] = node;
                _this.sceneMap.sceneInfo.scene.add(node.getMesh());

                area.addNode(node);
            });

            _this.children.push(area);
        }

        this.children.forEach(function (area) {
            _this.createNodeRelations(area);
        });

    }


    createRoutes(){
        let _this = this;
        let areaRoutes = this.game.findBy({
            type: Studio.WAYPOINT_ROUTE,
            level: this.sceneMap.mapEntry.level
        });

        areaRoutes.forEach(function (areaRoute) {
            let route = new Route(areaRoute.name, areaRoute);
            areaRoute.props.entries.forEach(function (nodeId) {
                let node = _this.nodeByNodeId[nodeId];
                route.addNode(node);
            });

            _this.sceneMap.sceneInfo.scene.add(route.getMesh());

            _this.routes.push(route);

        });
    }


    /**
     *
     * @param area {Area}
     */
    createNodeRelations(area){

        let _this = this;
        area.children.forEach(function (node) {
            node.entity.props.waypoints.forEach(function (waypoint) {
                let relNode = _this.nodeByNodeId[waypoint.linkId];
                if (relNode !== undefined)
                    node.addRelation(relNode);
                else
                    console.error(`[Waypoints] Invalid Waypoint ID ${waypoint.linkId} in node ${node.getId()})`)
            })
        });
    }


    /**
     *
     * @param nodeA {Result}
     * @param nodeB {Result}
     */
    generateSingleRelation(nodeA, nodeB){
        let dist = nodeA.mesh.position.distanceTo(nodeB.mesh.position);
        if (dist <= 3.05){

            let dir = new Vector3();
            dir.subVectors( nodeB.mesh.position, nodeA.mesh.position ).normalize();

            //take sure the raycast detects it
            nodeB.mesh.updateMatrixWorld(true);
            nodeB.mesh.children[0].updateMatrixWorld(true);


            //we assume to collide with our nodeB
            let collisions =
                (new Raycaster( nodeA.mesh.position, dir ))
                .intersectObjects(
                    [...this.meshesForRaycast, ...[nodeB.mesh.children[0]]]
                );

            if (collisions.length === 0) return false;

            //we collided with something unknown, stop
            if (collisions[0].object.name === undefined) return false;

            //we collided with something else, stop
            if (collisions[0].object.name.substr(0, 5) !== "node_")
                return false;

            //create relation
            nodeA.props.waypoints.push({
                linkId: nodeB.props.id,
                type: 3,
                relation: []
            });

            return true;
        }

        return false;

    }


    /**
     *
     * @param node {Node}
     */
    generateNearByRelation(node){

        let _this = this;
        let waypoints = this.game.findBy({
            level: this.level,
            type: Studio.AREA_LOCATION
        });

        waypoints.forEach(function (waypointOuter) {
            if (waypointOuter.props.id === node.getId())
                return;

            let status = _this.generateSingleRelation(waypointOuter, node.entity);

            //relation {waypointOuter} to {node} was created
            if (status === true){
                //create reverse relation
                node.entity.props.waypoints.push({
                    linkId: waypointOuter.props.id,
                    type: 3,
                    relation: []
                });
            }
        });

    }

    generateAllRelations(){
        let _this = this;

        let waypoints = this.game.findBy({
            level: this.level,
            type: Studio.AREA_LOCATION
        });

        waypoints.forEach(function (waypointOuter) {
            waypoints.forEach(function (waypointInner) {
                if (waypointInner === waypointOuter) return;
                _this.generateSingleRelation(waypointOuter, waypointInner);
            });

        });
    }

}
