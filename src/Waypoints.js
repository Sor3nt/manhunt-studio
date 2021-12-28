import Studio from "./Studio.js";
import Games from "./Plugin/Games.js";
import Node from "./Waypoints/Node.js";
import Area from "./Waypoints/Area.js";
import Route from "./Waypoints/Route.js";
import Placing from "./Waypoints/Placing.js";
import NodeGenerator from "./Waypoints/NodeGenerator.js";


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
            });


            area.children = [];
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
            meshes: this.sceneMap.sceneInfo.scene.children[1].children,
            nextNodeId: this.nextNodeId,
            position: position,
            game: this.game,
            callback: function (lastNodeId, nodes) {

                nodes.forEach(function (node) {
                    _this.nodeByNodeId[node.id] = node;
                });

                _this.nextNodeId = lastNodeId + 1;

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
                _this.createNodeRelations(area);

                _this.game.addToStorage(areaNode);

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

            route.highlight(true);
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

}


// import {Raycaster, Group, BoxGeometry, Geometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3} from "./Vendor/three.module.js";
// import Studio from "./Studio.js";
// import Games from "./Plugin/Games.js";
// import Result from "./Plugin/Loader/Result.js";
// import Areas from "./Waypoints/Areas.js";
//
// export default class Waypoints{
//
//     /**
//      *
//      * @param sceneMap {SceneMap}
//      */
//     constructor(sceneMap){
//         this.sceneMap = sceneMap;
//         this.locationById = {};
//         /* @type {{mix:Result[]}} */
//         this.locationsByRoute = {};
//         this.lineByRoute = {};
//         this.highlightedRouteName = undefined;
//
//         this.areaLocations = [];
//         this.routes = [];
//
//         this.game = Games.getGame(this.sceneMap.mapEntry.gameId);
//
//     }
//
//     setup(){
//
//         let areas = new Areas(this.sceneMap);
//
//
//         return;
//         let _this = this;
//
//         this.areaLocations = this.game.findBy({
//             type: Studio.AREA_LOCATION,
//             level: this.sceneMap.mapEntry.level
//         });
//
//         this.routes = this.game.findBy({
//             type: Studio.WAYPOINT_ROUTE,
//             level: this.sceneMap.mapEntry.level
//         });
//
//         this.areaLocations.forEach(function (location) {
//             _this.locationById[location.props.id] = location;
//             _this.createNode(location);
//
//         });
//
//         this.areaLocations.forEach(function (location) {
//
//             location.props.waypoints.forEach(function (waypoint) {
//                 _this.drawLineBetweenPoints(location, _this.locationById[waypoint.linkId]);
//
//             })
//         });
//         //
//         // this.routes.forEach(function (route) {
//         //     _this.createRoute(route);
//         // });
//
//     }
//
//     clear(){
//
//         let _this = this;
//         let areaLocations = this.game.findBy({
//             type: Studio.AREA_LOCATION
//         });
//
//         areaLocations.forEach(function (location) {
//
//             if (location.props.lines !== undefined){
//                 location.props.lines.forEach(function (lineInfo) {
//                     _this.sceneMap.sceneInfo.scene.remove(lineInfo.mesh);
//                 });
//             }
//
//             _this.sceneMap.sceneInfo.scene.remove(location.mesh);
//             _this.game.removeFromStorage(location);
//         });
//     }
//
//     /**
//      *
//      * @param location {Result}
//      * @returns {Mesh}
//      */
//     createNode(location){
//
//         const geometry = new BoxGeometry(0.5, 0.5, 0.5);
//         const material = new MeshBasicMaterial({color: 0x00ff00});
//         material.opacity = 0.2;
//         material.transparent = true;
//         const cube = new Mesh(geometry, material);
//         let group = new Group();
//
//         if (location.props.position !== undefined){
//             group.position.copy(location.props.position);
//         }
//
//         cube.name = location.name;
//         cube.userData.entity = location;
//
//         group.name = location.name;
//         group.add(cube);
//         group.userData.entity = location;
//         location.mesh = group;
//
//         this.sceneMap.sceneInfo.scene.add(group);
//     }
//
//     /**
//      *
//      * @param locationA {Result}
//      * @param locationB {Result}
//      */
//     drawLineBetweenPoints(locationA, locationB){
//         let _this = this;
//         let material = new LineBasicMaterial({color: 0x00ff00});
//         // material.opacity = 0.5;
//         material.transparent = true;
//
//         let geometry = new Geometry();
//         geometry.verticesNeedUpdate = true;
//         geometry.dynamic = true;
//
//         geometry.vertices.push(locationA.mesh.position);
//         geometry.vertices.push(locationB.mesh.position);
//
//         let line = new Line(geometry, material);
//         line.name = `${locationA.name}_to_${locationB.name}`;
//         // line.userData.entity = route;
//         // route.mesh = line;
//         this.sceneMap.sceneInfo.scene.add(line);
//
//         if (locationA.props.lines === undefined)
//             locationA.props.lines = [];
//
//         locationA.props.lines.push({
//             mesh: line,
//             location: locationB
//         });
//     }
//
//     /**
//      *
//      * @param route {Result}
//      */
//     createRoute(route){
//         let _this = this;
//         let material = new LineBasicMaterial({color: 0x00ff00});
//         material.opacity = 0.2;
//         material.transparent = true;
//
//         let geometry = new Geometry();
//         geometry.verticesNeedUpdate = true;
//         geometry.dynamic = true;
//         this.locationsByRoute[route.name] = [];
//
//         route.props.entries.forEach(function (locationId) {
//             let location = _this.locationById[locationId];
//             if (location === undefined){
//                 console.error("Unable to find location with ID ", locationId);
//                 return;
//             }
//             _this.locationsByRoute[route.name].push(location);
//
//             let pos = new Vector3();
//             pos.copy(location.mesh.position);
//             geometry.vertices.push(_this.locationById[locationId].mesh.position);
//         });
//
//         let line = new Line(geometry, material);
//         line.name = route.name;
//         line.userData.entity = route;
//         route.mesh = line;
//
//         this.lineByRoute[route.name] = route;
//         this.sceneMap.sceneInfo.scene.add(line);
//     }
//
//     highlightMesh(mesh, enable){
//         mesh.material.color.set(enable ? 0xff0000 : 0x00ff00);
//         mesh.material.opacity = enable ? 1 : 0.2;
//         mesh.material.transparent = !enable;
//         mesh.material.needsUpdate = true;
//     }
//
//     /**
//      *
//      * @param name {string}
//      */
//     highlightRoute(name){
//
//         let _this = this;
//
//         //reset old selection
//         if (this.highlightedRouteName !== undefined){
//             _this.highlightMesh(this.lineByRoute[this.highlightedRouteName].mesh, false);
//             this.locationsByRoute[this.highlightedRouteName].forEach(function (location) {
//                 _this.highlightMesh(location.mesh, false);
//             });
//         }
//
//         //enable new selection
//         this.highlightedRouteName = name;
//         this.highlightMesh(this.lineByRoute[name].mesh, true);
//         this.locationsByRoute[name].forEach(function (location) {
//             _this.highlightMesh(location.mesh, true);
//         });
//     }
//
//     generatedPointsCache = [];
//
//     /**
//      *
//      * @param entry {Result}
//      */
//     generateMeshByEntity(entry){
//         this.generatedPointsCache.push(entry.mesh.position.clone());
//         let position = entry.mesh.position.clone();
//         this.generateFromPosition(position);
//
//     }
//
//     generateRoutes(){
//
//         let _this = this;
//
//         let waypoints = this.game.findBy({
//             type: Studio.AREA_LOCATION
//         });
//
//         waypoints.forEach(function (waypointOuter) {
//             waypointOuter.props.waypoints = [];
//             waypoints.forEach(function (waypointInner) {
//                 if (waypointInner === waypointOuter) return;
//
//                 let dist = waypointOuter.mesh.position.distanceTo(waypointInner.mesh.position);
//                 if (dist <= 3.5){
//
//                     waypointOuter.props.waypoints.push(waypointInner);
//                     _this.drawLineBetweenPoints(waypointOuter, waypointInner);
//                 }
//
//             });
//         });
//     }
//
//     tempCount = 0;
//     generateFromPosition(position){
//         this.tempCount++;
//
//         if (this.tempCount > 6000)
//             return;
//
//         let _this = this;
//         let ogPos = position.clone();
//         let newPoints = [];
//         let nearBy = this.getDistanceToMesh(position);
//
//         ['left', 'right', 'front', 'back'].forEach(function (side) {
//             if (nearBy[side] === false) return;
//             if (nearBy[side] <= 2) return;
//
//             let boxes = nearBy[side] / 2;
//             if (boxes < 1) return;
//             if (boxes > 500){
//                 console.error('too many boxes on one row ?! ' + boxes);
//                 return;
//             }
//
//             let newPos = ogPos.clone();
//             for(let i = 0; i <= boxes; i++){
//
//                 if (side === "left" ) newPos.z = ogPos.z - (i * 2);
//                 if (side === "right") newPos.z = ogPos.z + (i * 2);
//                 if (side === "front") newPos.x = ogPos.x + (i * 2);
//                 if (side === "back" ) newPos.x = ogPos.x - (i * 2);
//
//                 //its going down, stop here
//                 if (_this.getDistanceToBottomMesh(newPos) > 1) continue;
//
//                 let posString = newPos.x + '_' + newPos.y + '_' + newPos.z;
//
//                 if (_this.generatedPointsCache.indexOf(posString) !== -1)
//                     continue;
//
//                 _this.generatedPointsCache.push(posString);
//
//                 newPoints.push(newPos.clone());
//             }
//         });
//
//
//         newPoints.forEach(function (position) {
//
//             let nextNode = new Result(
//                 Studio.AREA_LOCATION,
//                 `ai_${position.x}_${position.y}_${position.z}`,
//                 '',
//                 0,
//                 {
//
//                 },
//                 function () {
//                     console.error("HMMM TODO");
//                     debugger;
//                 }
//             );
//
//             // nextNode.hasChanges = true;
//
//             _this.createNode(nextNode);
//
//             //take sure we do not clip inside a wall
//             let adjusted = position.clone();
//             _this.adjustPosition(adjusted);
//             nextNode.mesh.position.copy(adjusted);
//
//             _this.game.addToStorage(nextNode);
//         });
//
//         newPoints.forEach(function (pos) {
//             _this.generateFromPosition(pos);
//         });
//     }
//
//     /**
//      * Take sure the have enough space to nearby meshes
//      *
//      * @param position {Vector3}
//      */
//     adjustPosition(position){
//         let nearBy = this.getDistanceToMesh(position);
//         let range = 1.5;
//
//         ['left', 'right', 'front', 'back'].forEach(function (side) {
//             if (nearBy[side] < range){
//                 if (side === "left" ) position.z -= nearBy[side] - range;
//                 if (side === "right") position.z += nearBy[side] - range;
//                 if (side === "front") position.x += nearBy[side] - range;
//                 if (side === "back" ) position.x -= nearBy[side] - range;
//
//             }
//         });
//     }
//
//
//     getDistanceToBottomMesh(position){
//         let ray = new Raycaster( position.clone(), new Vector3(0,-1, 0) );
//         let collisionResults = ray.intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );
//
//         if (collisionResults.length === 0) return 0.5;
//
//         return collisionResults[0].distance;
//     }
//
//     getDistanceToMesh(position){
//         // let used = [];
//         // this.sceneMap.sceneInfo.scene.traverse( function(child) {
//         //     if (child instanceof Mesh) {
//         //         if (child.parent.type === "Group")
//         //             used.push(child.parent);
//         //         else
//         //             used.push(child);
//         //     }
//         // });
//
//         let used = this.sceneMap.sceneInfo.scene.children[1].children;
// // console.log(used);
//         let col1 = (new Raycaster( position.clone(), new Vector3(0,0, 1) )).intersectObjects( used );
//         let col2 = (new Raycaster( position.clone(), new Vector3(0,0, -1) )).intersectObjects( used );
//         let col3 = (new Raycaster( position.clone(), new Vector3(1,0, 0) )).intersectObjects( used );
//         let col4 = (new Raycaster( position.clone(), new Vector3(-1,0, 0) )).intersectObjects( used );
//
//         return {
//             right: col1.length === 0 ? false : col1[0].distance,
//             left: col2.length === 0 ? false : col2[0].distance,
//             front: col3.length === 0 ? false : col3[0].distance,
//             back: col4.length === 0 ? false : col4[0].distance
//         };
//     }
//
// }