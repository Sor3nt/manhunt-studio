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
         * Waypoint
         */
        let catWaypoint = new Category({
            id: 'waypoint',
            label: 'Waypoint'
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



                        catWaypointArea.addType(new ActionType({
                            id: 'waypoint-area-create',
                            label: 'Start new area',
                            callback: function (states) {
                                studioScene.waypoints.placeNewNode();
                                document.body.requestPointerLock();

                                Studio.menu.closeAll();
                            }
                        }));

                        catWaypointArea.addType(new SelectboxType({
                            id: 'waypoint-area',
                            values: studioScene.waypoints.children.map(function (area) {
                                return area.name;
                            }),
                            callback: function (states) {

                            }
                        }));

                    }



                }
            }
        });

        catWaypoint.addSubCategory(catWaypointArea);

        Studio.menu.addCategory(catWaypoint);
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
