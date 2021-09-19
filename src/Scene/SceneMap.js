import {Geometry, Line, LineBasicMaterial, BoxGeometry, Mesh, MeshBasicMaterial, Vector3, SpotLight, GridHelper, PerspectiveCamera, HemisphereLight} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";
import Studio from "../Studio.js";
import Walk from "./Controler/Walk.js";
import Event from "../Event.js";
import Status from "../Status.js";
import Games from "../Plugin/Games.js";

export default class SceneMap extends SceneAbstract{

    /**
     *
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;

    /**
     * @type {Result}
     */
    mapEntry;

    /**
     *
     * @param entry {Result}
     * @param canvas {jQuery}
     * @param mapComponent {Map}
     */
    constructor(entry, canvas, mapComponent) {
        super(entry.level, canvas);

        let _this = this;
        this.mapEntry = entry;
        this.mapComponent = mapComponent;
        this.entitiesToProcess = [];
        this.entitiesProcess = 0;

        this.sceneInfo = StudioScene.createSceneInfo(
            canvas,
            this.name,
            new PerspectiveCamera(Studio.FOV, 1.33, 0.1, 1000),
            Walk,
            function(){

            }
        );

        Event.on(Event.MAP_ENTITIES_LOADED, function (props) {
            if (_this.mapEntry !== props.entry) return;
            _this.#setup();
        });

    }


    loadNearByEntities(){


        let len = this.entitiesToProcess.length;
        if (len === 0) return false;

        let processEntries = 15;
        for(let i = 0; i < processEntries; i++){
            let entity = this.entitiesToProcess.shift();
            let mesh = entity.data().getMesh();

            if (mesh !== false){
                mesh.name = entity.name;
                mesh.userData.entity = entity;
                entity.mesh = mesh;
                this.sceneInfo.scene.add(mesh);
                this.entitiesProcess++;
            }

            if (len - i - 1 === 0){

                StudioScene.changeScene(this.mapComponent.studioScene.name);

                Status.hide();

                return;
            }
        }

        let _this = this;
        requestAnimationFrame(function () {
            _this.loadNearByEntities();
        });

    }


    #setupWaypoints() {
        let game = Games.getGame(this.mapEntry.gameId);
        let areaLocations = game.findBy({
            type: Studio.AREA_LOCATION,
            level: this.mapEntry.level
        });

        let locationById = {};

        let _this = this;
        areaLocations.forEach(function (location) {

            const geometry = new BoxGeometry(0.5, 0.5, 0.5);
            const material = new MeshBasicMaterial({color: 0x00ff00});
            material.opacity = 0.2;
            material.transparent = true;
            const cube = new Mesh(geometry, material);

            cube.position.x = location.props.position.x;
            cube.position.y = location.props.position.z;
            cube.position.z = location.props.position.y * -1;

            locationById[location.props.id] = location;

            cube.name = location.name;
            cube.userData.entity = location;
            location.mesh = cube;
            _this.sceneInfo.scene.add(cube);

        });


        let routes = game.findBy({
            type: Studio.WAYPOINT_ROUTE,
            level: this.mapEntry.level
        });

        routes.forEach(function (route) {
            let material = new LineBasicMaterial({color: 0x00ff00});
            material.opacity = 0.2;
            material.transparent = true;

            let geometry = new Geometry();
            geometry.verticesNeedUpdate = true;
            geometry.dynamic = true;

            route.props.entries.forEach(function (locationId) {
                let pos = new Vector3();
                pos.copy(locationById[locationId].mesh.position);
                geometry.vertices.push(locationById[locationId].mesh.position);

            });

            let line = new Line(geometry, material);
            line.name = route.name;
            line.userData.entity = route;
            route.mesh = line;
            _this.sceneInfo.scene.add(line);
        });

    }

    #setup(){

        this.#setupWaypoints();

        let game = Games.getGame(this.mapEntry.gameId);
        this.entitiesToProcess = game.findBy({
            type: Studio.ENTITY,
            level: this.mapEntry.level
        });

        this.loadNearByEntities();


    }

    /**
     *
     * @param map {Group}
     */
    display( map ){
        this.sceneInfo.scene.add(map);
    }

}