import {Raycaster, Group, BoxGeometry, Geometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3} from "./Vendor/three.module.js";
import Studio from "./Studio.js";
import Games from "./Plugin/Games.js";
import Result from "./Plugin/Loader/Result.js";

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
        let group = new Group();

        if (location.props.position !== undefined){
            group.position.x = location.props.position.x;
            group.position.y = location.props.position.z;
            group.position.z = location.props.position.y * -1;
        }

        cube.name = location.name;
        cube.userData.entity = location;

        group.name = location.name;
        group.add(cube);
        group.userData.entity = location;
        location.mesh = group;

        this.sceneMap.sceneInfo.scene.add(group);
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
            if (location === undefined){
                console.error("Unable to find location with ID ", locationId);
                return;
            }
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

    generatedPointsCache = [];

    /**
     *
     * @param entry {Result}
     */
    generateMeshByEntity(entry){
        this.generatedPointsCache.push(entry.mesh.position.clone());
        let position = entry.mesh.position.clone();
        this.generateFromPosition(position);

    }

    tempCount = 0;



    generateFromPosition(position){
        this.tempCount++;

        if (this.tempCount > 6000)
            return;

        let _this = this;
        let ogPos = position.clone();
        let newPoints = [];
        let nearBy = this.nearByDistances(position);

        ['left', 'right', 'front', 'back'].forEach(function (side) {
            if (nearBy[side] === false) return;
            if (nearBy[side] <= 3) return;

            let boxes = nearBy[side] / 3;
            if (boxes < 1) return;
            if (boxes > 500){
                console.error('too many boxes on one row ?! ' + boxes);
                return;
            }

            let newPos = ogPos.clone();
            for(let i = 0; i <= boxes; i++){

                if (side === "left" ) newPos.z = ogPos.z - (i * 3);
                if (side === "right") newPos.z = ogPos.z + (i * 3);
                if (side === "front") newPos.x = ogPos.x + (i * 3);
                if (side === "back" ) newPos.x = ogPos.x - (i * 3);

                //its going down, stop here
                if (_this.distanceToBottom(newPos) > 1) continue;

                let posString = newPos.x + '_' + newPos.y + '_' + newPos.z;

                if (_this.generatedPointsCache.indexOf(posString) !== -1)
                    continue;

                _this.generatedPointsCache.push(posString);

                newPoints.push(newPos.clone());
            }
        });


        newPoints.forEach(function (position) {

            let nextNode = new Result(
                Studio.WAYPOINT_ROUTE,
                'ai' ,
                '',
                0,
                {

                },
                function () {
                    console.error("HMMM TODO");
                    debugger;
                }
            );

            _this.createNode(nextNode);
            let adjusted = position.clone();

            _this.adjustPosition(adjusted);
            nextNode.mesh.position.copy(adjusted);
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
        let nearBy = this.nearByDistances(position);
        let range = 1.5;

        ['left', 'right', 'front', 'back'].forEach(function (side) {
            if (nearBy[side] < range){
                if (side === "left" ) position.z -= nearBy[side] - range;
                if (side === "right") position.z += nearBy[side] - range;
                if (side === "front") position.x += nearBy[side] - range;
                if (side === "back" ) position.x -= nearBy[side] - range;

            }
        });
    }


    distanceToBottom(position){
        let ray = new Raycaster( position.clone(), new Vector3(0,-1, 0) );
        let collisionResults = ray.intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );

        if (collisionResults.length === 0) return 0.5;

        return collisionResults[0].distance;
    }

    nearByDistances(position){
        // let used = [];
        // this.sceneMap.sceneInfo.scene.traverse( function(child) {
        //     if (child instanceof Mesh) {
        //         used.push(child);
        //     }
        // });

        let col1 = (new Raycaster( position.clone(), new Vector3(0,0, 1) )).intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );
        let col2 = (new Raycaster( position.clone(), new Vector3(0,0, -1) )).intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );
        let col3 = (new Raycaster( position.clone(), new Vector3(1,0, 0) )).intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );
        let col4 = (new Raycaster( position.clone(), new Vector3(-1,0, 0) )).intersectObjects( this.sceneMap.sceneInfo.scene.children[1].children );

        return {
            right: col1.length === 0 ? false : col1[0].distance,
            left: col2.length === 0 ? false : col2[0].distance,
            front: col3.length === 0 ? false : col3[0].distance,
            back: col4.length === 0 ? false : col4[0].distance
        };
    }

}