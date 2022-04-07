import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as MapComponent} from "./../Plugin/Component/Map.js";
import Status from "../Status.js";
import Storage from "../Storage.js";
import Entity from "../Entity.js";
import Result from "../Plugin/Loader/Result.js";
import Games from "../Plugin/Games.js";

export default class Map {

    /**
     * @type {MapComponent}
     */
    model = undefined;

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.partialLoad = [];
        this.section = section;
        this.mapComponents = {};

        let _this = this;
        Event.on(Event.OPEN_ENTRY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.MAP) return;
            _this.displayEntry(entry);
        });

        Event.on(Event.MAP_FOCUS_ENTITY,

            /**
             * @param props { {entry: Result, mapEntry: Result} }
             */

            function (props) {
                /** @type {Result}  */
                let entry = props.entry;
                _this.section.tabNavigation.show(props.mapEntry.level);

                _this.focusEntry(entry);
            }
        );
    }

    /**
     * @param entry {Result}
     */
    focusEntry(entry){

        /**
         * @type {SceneMap}
         */
        let studioScene = this.mapComponent.studioScene;
        if (entry.type === Studio.WAYPOINT_ROUTE){
            studioScene.sceneInfo.control.setObject(entry.props.locations[0].mesh);
            studioScene.sceneInfo.control.setMode('transform');
            studioScene.waypoints.highlightRoute(entry.name);
        }else{
            studioScene.sceneInfo.lookAt = entry;
            studioScene.sceneInfo.control.setObject(entry.mesh);
            studioScene.sceneInfo.control.setMode('transform');
        }

    }

    /**
     * @param entry {Result}
     */
    displayEntry(entry){

        let _this = this;
        requestAnimationFrame(function () {
            Status.show();
            requestAnimationFrame(async function () {
                _this.#_displayEntry(entry);
            });
        });

    }

    #_displayEntry(entry){


        //todo: das stimmt hier nicht, wir laden ja immer neu auch wenn der tab bereits offen ist...

        if (this.mapComponents[entry.level] === undefined){
            this.createEntities(entry);

            this.mapComponent = new MapComponent({ entry: entry });
            this.mapComponent.displayName = entry.level;

            this.section.add(this.mapComponent);
        }


        this.section.tabNavigation.show(entry.level);
    }


    /**
     * Create Game-Entities
     * Each entity represents a object in the 3d world.
     *
     * @param mapEntry {Result}
     */
    createEntities(mapEntry){
        // let gameId = this.gameId;

        let game = Games.getGame(mapEntry.gameId);
        this.partialLoad  = game.findBy({
            type: Studio.INST,
            level: mapEntry.level
        });

        let _this = this;


        //workaround, it can happen that the MAP_ENTITIES_LOADED event is triggered before all modules are loaded....
        window.setTimeout(function () {

            _this.loadNextEntryBatch(mapEntry);
        }, 1000);

    }

    loadNextEntryBatch(mapEntry){
        let _this = this;
        let len = this.partialLoad.length;
        if (len === 0) return false;

        let processEntries = 15;

        for(let i = 0; i < processEntries; i++){
            let inst = this.partialLoad.shift();

            let entity = new Entity(mapEntry, inst);
            let result = new Result(
                Studio.ENTITY,
                inst.name,
                "",
                0,
                {
                    className: inst.data().entityClass
                },
                function(){
                    return entity;
                }
            );
            inst.entity = entity;

            result.props.instance = entity.inst;
            result.props.glgEntry = entity.glgEntry;

            result.level = mapEntry.level;
            result.gameId = mapEntry.gameId;

            Storage.add(result);


            if (len - i - 1 === 0){
                Event.dispatch(Event.MAP_ENTITIES_LOADED, { entry: mapEntry });
                return true;
            }
        }


        requestAnimationFrame(function () {
            _this.loadNextEntryBatch(mapEntry);
        });

        return len - processEntries;
    }

}
