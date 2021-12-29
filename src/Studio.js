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
import SelectboxType from "./Menu/Types/SelectboxType.js";
import ActionType from "./Menu/Types/ActionType.js";
import Keyboard from "./Keyboard.js";
import Mouse from "./Mouse.js";
import Games from "./Plugin/Games.js";
import Grf from "./Plugin/Builder/Game/ManhuntGeneric/Grf.js";

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
        // Status.showWelcome();

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
            enabled: false,
            callback: function (states) {

                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    let game = Games.getGame(studioScene.mapEntry.gameId);
                    let level = studioScene.mapEntry.level;

                    let binary = Grf.build(game, level);
                    Save.output(binary, 'teest.grf');
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

        catWaypoint.addType(new CheckboxType({
            id: 'waypoint-show-nodes',
            label: 'Show nodes',
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
            callback: function (states) {
                let studioScene = StudioScene.getStudioSceneInfo().studioScene;
                if (studioScene instanceof SceneMap){
                    studioScene.waypoints.routeVisible(states.active);
                }
            }
        }));


        /**
         * Waypoint => Area
         */
        let catWaypointArea = new Category({
            id: 'waypoint-areas',
            label: 'Areas',
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
                            id: 'waypoint-area-create',
                            label: 'Start new area',
                            callback: function (states) {

                                let name = prompt('New Area Name', 'area1');
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
                                    if (area.children.length > 0){
                                        let node = area.children[0];
console.log("EHH nodes?", node);
                                        studioSceneInfo.control.playerCollider.end.copy(node.position);
                                        studioSceneInfo.camera.position.copy(node.position);
                                    }

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
                                     * Look at the first node in the area
                                     */
                                    if (area.children.length > 0){
                                        let node = area.children[0];
                                        //
                                        // studioSceneInfo.control.playerCollider.end.copy(node.position);
                                        // studioSceneInfo.camera.position.copy(node.position);

                                        waypoints.nodeGenerate(area, node.getMesh().position);

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

//
                        });

//                         catWaypointArea.addType(new SelectboxType({
//                             id: 'waypoint-area',
//                             values: studioScene.waypoints.children.map(function (area) {
//                                 return area.name;
//                             }),
//                             callback: function (states) {
// console.log("hhhh", states);
//                             }
//                         }));

                    }



                }
            }
        });

        catWaypoint.addSubCategory(catWaypointArea);
        catWaypoint.addType(new ActionType({
            id: 'waypoint-clear',
            label: 'Clear anything',
            callback: function (states) {

                let studioSceneInfo = StudioScene.getStudioSceneInfo();
                if (studioSceneInfo === null)
                    return;

                let studioScene = studioSceneInfo.studioScene;
                if (studioScene instanceof SceneMap) {

                    let waypoints = studioScene.waypoints;
                    waypoints.clear();
                }
            }
        }));

        Studio.menu.addCategory(catWaypoint);
        //
        // let test = Studio.menu.getById('waypoint-area-create');
        // console.log("hhh",test);

        //
        // Menu.create();
        // Menu.addCategory('File');
        // Menu.addEntry('File', 'Save', function () {
        //     Save.save();
        // });
        // Menu.addEntry('File', 'Export (experimental)', function () {
        //     let exporter = new OBJExporter();
        //     const result = exporter.parse( StudioScene.getStudioSceneInfo().scene );
        //
        //     let blob = new Blob( [ result ], { type: 'application/octet-stream' } );
        //
        //     const link = document.createElement("a");
        //     link.href = URL.createObjectURL(blob);
        //     link.download = "export.obj";
        //     link.click();
        //     link.remove();
        //
        //     console.log(result);
        // });
        //
        // Menu.addCategory('Waypoints');
        // Menu.addEntry('Waypoints', 'Create Node', function (element) {
        //
        //     let studioScene = StudioScene.getStudioSceneInfo().studioScene;
        //     if (studioScene instanceof SceneMap){
        //         // studioScene.waypoints.
        //     }
        //
        // });
        //
        // Menu.addEntry('Waypoints', 'Show nodes<i class="fas fa-check" style="float: right"></i>', function (element) {
        //
        //     let enable = true;
        //     let box = jQuery(element).find('i');
        //     if (box.hasClass('fa-check')){
        //         box.removeClass('fa-check');
        //         enable = false;
        //     }else{
        //         box.addClass('fa-check');
        //     }
        //
        //     Event.dispatch(Event.WAYPOINT_SHOW_NODES, {
        //         enabled: enable
        //     });
        //
        // });
        // Menu.addEntry('Waypoints', 'Show relations<i class="fas fa-check" style="float: right"></i>', function (element) {
        //
        //     let enable = true;
        //     let box = jQuery(element).find('i');
        //     if (box.hasClass('fa-check')){
        //         box.removeClass('fa-check');
        //         enable = false;
        //     }else{
        //         box.addClass('fa-check');
        //     }
        //
        //     Event.dispatch(Event.WAYPOINT_SHOW_RELATIONS, {
        //         enabled: enable
        //     });
        //
        // });

    }

}
