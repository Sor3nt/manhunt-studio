import Loader from "./Plugin/Loader.js";
import Components from "./Plugin/Components.js";
import Layout from "./Layout.js";
import WebGL from "./WebGL.js";
import Status from "./Status.js";
import Save from "./Save.js";
import Menu from "./Menu.js";
import StudioScene from "./Scene/StudioScene.js";
import CheckboxType from "./Menu/Types/CheckboxType.js";
import Category from "./Menu/Category.js";
import SceneMap from "./Scene/SceneMap.js";
import ActionType from "./Menu/Types/ActionType.js";
import Keyboard from "./Keyboard.js";
import Mouse from "./Mouse.js";
import Games from "./Plugin/Games.js";
import Grf from "./Plugin/Builder/Game/ManhuntGeneric/Grf.js";
import Route from "./Waypoints/Route.js";
import Result from "./Plugin/Loader/Result.js";
import Waypoints from "./Waypoints.js";

export default class Studio{

    /**
     *
     * @type {Menu|null}
     */
    static menu = null;

    static FOV = 57.29578; //Default MH2 FOV

    /**
     * Global {Result} types for the {Storage} class
     */
    static MAP = 1;
    static MODEL = 2;
    static GLG = 3;
    static ANIMATION = 4;
    static INST = 5;
    static TEXTURE = 6;
    static TVP = 7;
    static ENTITY = 8;
    static MLS = 9;
    static WORLD = 10;
    static IMPORTED = 11;
    static FILE = 12;
    static AREA_LOCATION = 13;
    static WAYPOINT_ROUTE = 14;
    static WAYPOINT_STOPPER = 15;

    static registerPlugins(){
        Loader.registerPlugins();
        Components.registerSections();
    }

    static boot() {

        Status.element = jQuery('#status');
        WebGL.boot();
        Studio.registerPlugins();
        Keyboard.setup();
        Mouse.setup();

        Studio.createMenu();
        new Save();


        Layout.createDefaultLayout();

        WebGL.render();

        Status.hide();
        Status.showWelcome();

    }

    static createMenu(){

        Studio.menu = new Menu();

        /**
         * Save
         */
        let catSave = new Category({
            id: 'save',
            label: 'Save'
        });

        catSave.addType(new ActionType({
            id: 'save-waypoint',
            label: 'Waypoint',
            // enabled: false,
            callback: function (states) {

                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    // console.log("ok");
                    let game = Games.getGame(studioScene.mapEntry.gameId);
                    let level = studioScene.mapEntry.level;

                    let binary = Grf.build(game, level);
                    Save.output(binary, 'mapAI.grf');
                    Studio.menu.closeAll();
                }

            }
        }));

        Studio.menu.addCategory(catSave);


        /**
         * Waypoint
         */
        let catWaypoint = new Category({
            id: 'waypoint',
            label: 'Waypoint',
            enabled: false
        });

        catWaypoint.addType(new ActionType({
            id: 'waypoint-load-nodes',
            label: 'Load Waypoints',
            callback: function (states) {
                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){

                    studioScene.waypoints = new Waypoints(studioScene);
                    // studioScene.waypoints.nodeVisible(true);
                    // studioScene.waypoints.lineVisible(true);
                    // studioScene.waypoints.routeVisible(true);

                    Studio.menu.getById('waypoint-load-nodes').disable();

                    Studio.menu.getById('waypoint-show-nodes').enable();
                    Studio.menu.getById('waypoint-show-relations').enable();
                    Studio.menu.getById('waypoint-show-routes').enable();
                    Studio.menu.getById('waypoint-show-nodes').triggerClick();
                    Studio.menu.getById('waypoint-show-relations').triggerClick();
                    Studio.menu.getById('waypoint-show-routes').triggerClick();
                    Studio.menu.getById('waypoint-routes').enable();
                    Studio.menu.getById('waypoint-areas').enable();
                    Studio.menu.getById('waypoint-clear').enable();

                }
            }
        }));

        catWaypoint.addType(new CheckboxType({
            id: 'waypoint-show-nodes',
            label: 'Show nodes',
            enabled: false,
            callback: function (states) {
                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    studioScene.waypoints.nodeVisible(states.active);

                    if (states.active){
                        let relStates = Studio.menu.getStatesById('waypoint-show-relations');
                        if(relStates.active)
                            studioScene.waypoints.lineVisible(true);

                        let routesStates = Studio.menu.getStatesById('waypoint-show-routes');
                        if(routesStates.active)
                            studioScene.waypoints.routeVisible(true);
                    }else{
                        studioScene.waypoints.lineVisible(false);
                        studioScene.waypoints.routeVisible(false);
                    }
                }
            }
        }));

        catWaypoint.addType(new CheckboxType({
            id: 'waypoint-show-relations',
            label: 'Show relations',
            enabled: false,
            callback: function (states) {
                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    studioScene.waypoints.lineVisible(states.active);
                }
            }
        }));

        catWaypoint.addType(new CheckboxType({
            id: 'waypoint-show-routes',
            label: 'Show routes',
            enabled: false,
            callback: function (states) {
                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    studioScene.waypoints.routeVisible(states.active);
                    studioScene.waypoints.routeHighlight(states.active);
                }
            }
        }));


        /**
         * Waypoint => Routes
         */
        let catWaypointRoutes = new Category({
            id: 'waypoint-routes',
            label: 'Routes',
            enabled: false,
            callback: function (states) {
                catWaypointRoutes.clear();

                let studioSceneInfo = StudioScene.getStudioSceneInfo();
                if (studioSceneInfo === null)
                    return;

                let studioScene = studioSceneInfo.studioScene;
                if (studioScene instanceof SceneMap) {

                    catWaypointRoutes.addType(new ActionType({
                        id: 'waypoint-route-create',
                        label: 'Create route',
                        callback: function (states) {

                            let name = prompt('New Route Name', '');
                            if (name === null || name === '')
                                return;

                            /**
                             * We need to take sure the nodes are showed
                             */
                            let showNodesType = Studio.menu.getById('waypoint-show-nodes');
                            if (showNodesType.states.active === false){
                                showNodesType.triggerClick();
                            }

                            /**
                             * We need to take sure the nodes relations are showed
                             */
                            let showNodesRelType = Studio.menu.getById('waypoint-show-relations');
                            if (showNodesRelType.states.active === false){
                                showNodesRelType.triggerClick();
                            }

                            let game = Games.getGame(studioScene.mapEntry.gameId);


                            /**
                             * @type {Walk}
                             */
                            let control = studioSceneInfo.control;
                            control.setMode('route-selection');

                            let route = new Route(name, null);
                            studioScene.sceneInfo.scene.add(route.getMesh());
                            route.setVisible(true);
                            route.highlight(true);

                            let routeData = {
                                name: name,
                                entries: [],
                                locations: []
                            };

                            let result = new Result(
                                Studio.WAYPOINT_ROUTE,
                                route.name,
                                "",
                                0,
                                routeData,
                                function(){
                                    return routeData;
                                }
                            );

                            result.level = studioScene.mapEntry.level;
                            route.entity = result;

                            game.addToStorage(result);
                            waypoints.routes.push(route);

                            waypoints.routeSelection(route);
                            Studio.menu.closeAll();
                        }
                    }));

                    let waypoints = studioScene.waypoints;
                    waypoints.routes.forEach(function (route) {


                        let catWaypointRouteEntry = new Category({
                            id: 'waypoint-route-' + route.name,
                            label: route.name,
                            callback: function (states) {  }
                        });


                        catWaypointRouteEntry.addType(new ActionType({
                            id: 'waypoint-route-remove-' + route.name,
                            label: 'Remove',
                            callback: function (states) {

                                if (!confirm(`Delete route ${route.name}?`))
                                    return;

                                let game = Games.getGame(studioScene.mapEntry.gameId);

                                let entity = game.findOneBy({
                                    level: studioScene.mapEntry.level,
                                    type: Studio.WAYPOINT_ROUTE,
                                    name: route.name
                                });

                                game.removeFromStorage(entity);

                                route.setVisible(false);
                                route.highlight(false);

                                waypoints.routes.splice(waypoints.routes.indexOf(route), 1);

                                Studio.menu.closeAll();


                            }
                        }));

                        catWaypointRouteEntry.addType(new ActionType({
                            id: 'waypoint-route-route-' + route.name,
                            label: 'Edit',
                            callback: function (states) {
                                waypoints.routeVisible(false);
                                waypoints.routeHighlight(false);
                                route.setVisible(true);
                                route.highlight(true);

                                /**
                                 * @type {Walk}
                                 */
                                let control = studioSceneInfo.control;
                                control.setMode('route-selection');

                                waypoints.routeSelection(route);
                                Studio.menu.closeAll();

                            }
                        }));

                        catWaypointRouteEntry.addType(new ActionType({
                            id: 'waypoint-route-route-' + route.name,
                            label: 'Clear',
                            callback: function (states) {

                                route.highlight(false);
                                route.clear();
                                Studio.menu.closeAll();

                            }
                        }));


                        catWaypointRoutes.addSubCategory(catWaypointRouteEntry);

                    });
                }
            }
        });
        catWaypoint.addSubCategory(catWaypointRoutes);

        /**
         * Waypoint => Area
         */
        let catWaypointArea = new Category({
            id: 'waypoint-areas',
            label: 'Areas',
            enabled: false,
            callback: function (states) {
                if (states.open){
                    catWaypointArea.clear();

                    let studioSceneInfo = StudioScene.getStudioSceneInfo();
                    if (studioSceneInfo === null)
                        return;

                    let studioScene = studioSceneInfo.studioScene;
                    if (studioScene instanceof SceneMap){


                        let waypoints = studioScene.waypoints;

                        catWaypointArea.addType(new ActionType({
                            id: 'waypoint-stopper-create',
                            label: 'Create stopper',
                            callback: function (states) {
                                waypoints.placeStopper();
                                /**
                                 * @type {Walk}
                                 */
                                let control = studioSceneInfo.control;
                                if (control.mode !== 'fly')
                                    control.setMode('fly');

                                document.body.requestPointerLock();

                                Studio.menu.closeAll();
                            }
                        }));

                        catWaypointArea.addType(new ActionType({
                            id: 'waypoint-area-create',
                            label: 'Start new area',
                            callback: function (states) {

                                let name = prompt('New Area Name', 'area1');
                                if (name === null || name === '')
                                    return;

                                waypoints.placeNewNode(name);
                                document.body.requestPointerLock();

                                Studio.menu.closeAll();
                            }
                        }));


                        waypoints.children.forEach(function (area) {

                            let catWaypointAreaEntry = new Category({
                                id: 'waypoint-area-' + area.name,
                                label: area.name,
                                callback: function (states) {

                                }
                            });

                            catWaypointAreaEntry.addType(new ActionType({
                                id: 'waypoint-area-node-' + area.name,
                                label: 'Add node',
                                callback: function (states) {

                                    /**
                                     * We need to take sure the nodes are showed
                                     */
                                    let showNodesType = Studio.menu.getById('waypoint-show-nodes');
                                    if (showNodesType.states.active === false){
                                        showNodesType.triggerClick();
                                    }

                                    /**
                                     * Look at the first node in the area
                                     */
                                    // if (area.children.length > 0){
                                    //     let node = area.children[0];
                                    //     studioSceneInfo.control.playerCollider.end.copy(node.position);
                                    //     studioSceneInfo.camera.position.copy(node.position);
                                    // }

                                    requestAnimationFrame(function () {
                                        waypoints.placeNewNode(area.name);
                                        document.body.requestPointerLock();
                                    });

                                    Studio.menu.closeAll();
                                }
                            }));


                            catWaypointAreaEntry.addType(new ActionType({
                                id: `waypoint-area-${area.name}-gen`,
                                label: 'Generate Mesh',
                                callback: function (states) {

                                    /**
                                     * We need to take sure the nodes are showed
                                     */
                                    let showNodesType = Studio.menu.getById('waypoint-show-nodes');
                                    if (showNodesType.states.active === false){
                                        showNodesType.triggerClick();
                                    }

                                    /**
                                     * @type {Walk}
                                     */
                                    let control = studioSceneInfo.control;
                                    if (control.mode === "transform"){
                                        waypoints.nodeGenerate(area, control.object.position);

                                    }else{


                                        /**
                                         * Look at the first node in the area
                                         */
                                        if (area.children.length > 0){
                                            let node = area.children[0];

                                            waypoints.nodeGenerate(area, node.getMesh().position);

                                        }
                                    }



                                    Studio.menu.closeAll();
                                }
                            }));


                            catWaypointAreaEntry.addType(new ActionType({
                                id: `waypoint-area-${area.name}-clear`,
                                label: 'Clear',
                                callback: function (states) {

                                    let studioSceneInfo = StudioScene.getStudioSceneInfo();
                                    if (studioSceneInfo === null)
                                        return;

                                    let studioScene = studioSceneInfo.studioScene;
                                    if (studioScene instanceof SceneMap) {

                                        let waypoints = studioScene.waypoints;
                                        waypoints.clear(area.name);
                                    }
                                }
                            }));


                            catWaypointArea.addSubCategory(catWaypointAreaEntry);

                        });


                    }



                }
            }
        });

        catWaypoint.addSubCategory(catWaypointArea);
        catWaypoint.addType(new ActionType({
            id: 'waypoint-clear',
            label: 'Clear everything',
            enabled: false,
            callback: function (states) {

                if (!confirm('Clear all Areas and Routes?'))
                    return;

                let studioSceneInfo = StudioScene.getStudioSceneInfo();
                if (studioSceneInfo === null)
                    return;

                let studioScene = studioSceneInfo.studioScene;
                if (studioScene instanceof SceneMap) {

                    let waypoints = studioScene.waypoints;
                    waypoints.routes.forEach(function (route) {
                        route.clear();
                    });

                    waypoints.clear();
                }
            }
        }));

        Studio.menu.addCategory(catWaypoint);

    }

}
