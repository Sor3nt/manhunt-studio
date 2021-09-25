import {BoxGeometry, Geometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3} from "./Vendor/three.module.js";
import Studio from "./Studio.js";
import Games from "./Plugin/Games.js";

export default class Waypoints{

    /**
     *
     * @param sceneMap {SceneMap}
     */
    constructor(sceneMap){
        this.sceneMap = sceneMap;
        this.locationById = {};
        /* @type {{mix:Result[]}} */
        this.locationsByRoute = {};
        this.lineByRoute = {};
        this.highlightedRouteName = undefined;

        this.areaLocations = [];
        this.routes = [];

        this.game = Games.getGame(this.sceneMap.mapEntry.gameId);
    }

    setup(){
        let _this = this;

        this.areaLocations = this.game.findBy({
            type: Studio.AREA_LOCATION,
            level: this.sceneMap.mapEntry.level
        });

        this.routes = this.game.findBy({
            type: Studio.WAYPOINT_ROUTE,
            level: this.sceneMap.mapEntry.level
        });

        this.areaLocations.forEach(function (location) {
            _this.locationById[location.props.id] = location;
            _this.createNode(location);
        });

        this.routes.forEach(function (route) {
            _this.createRoute(route);
        });

    }

    /**
     *
     * @param location {Result}
     * @returns {Mesh}
     */
    createNode(location){

        const geometry = new BoxGeometry(0.5, 0.5, 0.5);
        const material = new MeshBasicMaterial({color: 0x00ff00});
        material.opacity = 0.2;
        material.transparent = true;
        const cube = new Mesh(geometry, material);

        cube.position.x = location.props.position.x;
        cube.position.y = location.props.position.z;
        cube.position.z = location.props.position.y * -1;

        cube.name = location.name;
        cube.userData.entity = location;
        location.mesh = cube;
        this.sceneMap.sceneInfo.scene.add(cube);
    }

    /**
     *
     * @param route {Result}
     */
    createRoute(route){
        let _this = this;
        let material = new LineBasicMaterial({color: 0x00ff00});
        material.opacity = 0.2;
        material.transparent = true;

        let geometry = new Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;
        this.locationsByRoute[route.name] = [];

        route.props.entries.forEach(function (locationId) {
            let location = _this.locationById[locationId];
            _this.locationsByRoute[route.name].push(location);

            let pos = new Vector3();
            pos.copy(location.mesh.position);
            geometry.vertices.push(_this.locationById[locationId].mesh.position);
        });

        let line = new Line(geometry, material);
        line.name = route.name;
        line.userData.entity = route;
        route.mesh = line;

        this.lineByRoute[route.name] = route;
        this.sceneMap.sceneInfo.scene.add(line);
    }

    highlightMesh(mesh, enable){
        mesh.material.color.set(enable ? 0xff0000 : 0x00ff00);
        mesh.material.opacity = enable ? 1 : 0.2;
        mesh.material.transparent = !enable;
        mesh.material.needsUpdate = true;
    }

    /**
     *
     * @param name {string}
     */
    highlightRoute(name){

        let _this = this;

        //reset old selection
        if (this.highlightedRouteName !== undefined){
            _this.highlightMesh(this.lineByRoute[this.highlightedRouteName].mesh, false);
            this.locationsByRoute[this.highlightedRouteName].forEach(function (location) {
                _this.highlightMesh(location.mesh, false);
            });
        }

        //enable new selection
        this.highlightedRouteName = name;
        this.highlightMesh(this.lineByRoute[name].mesh, true);
        this.locationsByRoute[name].forEach(function (location) {
            _this.highlightMesh(location.mesh, true);
        });
    }

}