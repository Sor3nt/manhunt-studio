import Studio from "./Studio.js";
import Games from "./Plugin/Games.js";
import Node from "./Waypoints/Node.js";
import Area from "./Waypoints/Area.js";
import Route from "./Waypoints/Route.js";
import Placing from "./Waypoints/Placing.js";
import NodeGenerator from "./Waypoints/NodeGenerator.js";
import RouteSelection from "./Waypoints/RouteSelection.js";
import {Vector3, Raycaster} from "./Vendor/three.module.js";


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
     * @param sceneMap {SceneMap}
     */
    constructor(sceneMap){
        this.sceneMap = sceneMap;
        this.game = Games.getGame(sceneMap.mapEntry.gameId);
        this.level = sceneMap.mapEntry.level;

        this.createAreasAndNodes();
        this.createRoutes();

        let test = Studio.menu.getById('waypoint');
        console.log("hhh",test);
        test.enable();

    }

    getMeshesForRaycast(){
        return this.sceneMap.sceneInfo.scene.children[1].children;
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
     * @param areaName {string|undefined}
     */
    clear(areaName){
        let _this = this;
        // if (areaName === undefined)
        this.children.forEach(function (area) {
            if (areaName !== undefined && areaName !== area.name)
                return;

            area.children.forEach(function (node) {
                _this.sceneMap.sceneInfo.scene.remove(node.getMesh());

                node.lines.forEach(function (line) {
                    _this.sceneMap.sceneInfo.scene.remove(line);
                });

                node.lines = [];
                node.children = [];

                _this.game.removeFromStorage(node.entity);
            });


            area.children = [];
        });

        if (areaName === undefined)
            this.nextNodeId = 0;

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
            onPlaceCallback: function () {

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
            meshes: this.getMeshesForRaycast(),
            nextNodeId: this.nextNodeId,
            position: position,
            game: this.game,
            level: this.level,
            callback: function (lastNodeId, nodes) {


                nodes.forEach(function (node) {
                    _this.nodeByNodeId[node.id] = node;
                });

                _this.nextNodeId = lastNodeId + 1;

                _this.generateRoutes();
                _this.createNodeRelations(area);

            }

        })
    }

    placeNewNode(areaName){

        let _this = this;

        new Placing({
            sceneInfo: this.sceneMap.sceneInfo,
            nextNodeId: this.nextNodeId,
            areaName: areaName,
            onPlaceCallback: function (areaNode) {
                _this.nodeByNodeId[_this.nextNodeId] = areaNode;

                let area = _this.getCreateArea(areaName);
                area.addNode(areaNode);

                areaNode.entity.level = _this.level;
                _this.game.addToStorage(areaNode.entity);


                _this.generateRoutes();
                _this.createNodeRelations(area);


                _this.nextNodeId++;

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
            let route = new Route(areaRoute.name);
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
                node.addRelation(_this.nodeByNodeId[waypoint.linkId]);
            })
        });
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
            // let tmpLow = 10000000;
            waypoints.forEach(function (waypointInner) {
                if (waypointInner === waypointOuter) return;

                let dist = waypointOuter.mesh.position.distanceTo(waypointInner.mesh.position);
                if (dist <= 3.05){


                    let dir = new Vector3();
                    dir.subVectors( waypointInner.mesh.position, waypointOuter.mesh.position ).normalize();

                    let collisions = (new Raycaster( waypointOuter.mesh.position, dir )).intersectObjects( _this.getMeshesForRaycast() );

                    if (collisions.length === 0) return;
                    // console.log(collisions[0].distance );
                    if (collisions[0].distance < 3.05) return;

                    waypointOuter.props.waypoints.push({
                        linkId: waypointInner.props.id,
                        type: 3,
                        relation: []
                    });

                }

            });

        });
    }

}
