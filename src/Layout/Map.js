import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as MapComponent} from "./../Plugin/Component/Map.js";
import Status from "../Status.js";
import Storage from "../Storage.js";
import Entity from "../Entity.js";
import Result from "../Plugin/Loader/Result.js";

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
                if (entry.type !== Studio.ENTITY) return;

                // let StudioScene.getStudioSceneInfo(props.mapEntry.name)
                _this.section.tabNavigation.show(props.mapEntry.name);

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
        studioScene.sceneInfo.control.setObject(entry.mesh);
        studioScene.sceneInfo.control.setMode('transform');
        // studioScene.sceneInfo.control.keyStates.modeSelectObject = true; //note: inverted...

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

        this.createEntities(entry);

        //todo: das stimmt hier nicht, wir laden ja immer neu auch wenn der tab bereits offen ist...

        if (this.mapComponents[entry.name] === undefined){
            this.mapComponent = new MapComponent({ entry: entry });
            this.mapComponent.displayName = entry.name;
            this.section.add(this.mapComponent);
        }


        this.section.tabNavigation.show(entry.name);
    }


    /**
     * Create Game-Entities
     * Each entity represents a object in the 3d world.
     */
    /**
     *
     * @param mapEntry {Result}
     */
    createEntities(mapEntry){
        // let gameId = this.gameId;

        this.partialLoad  = Storage.findBy({
            type: Studio.INST,
            level: mapEntry.level,
            gameId: mapEntry.gameId
        });

        this.loadNextEntryBatch(mapEntry);

        // instEntries.forEach(function (inst) {
        //     let entity = new Entity(mapEntry, inst);
        //     let result = new Result(
        //         Studio.ENTITY,
        //         inst.name,
        //         "",
        //         0,
        //         {
        //             className: inst.data().entityClass
        //         },
        //         function(){
        //             return entity;
        //         }
        //     );
        //
        //     result.props.instance = entity.inst;
        //     result.props.glgEntry = entity.glgEntry;
        //
        //     result.level = mapEntry.level;
        //     result.gameId = mapEntry.gameId;
        //
        //     Storage.add(result);
        //
        // });
        //
        // Event.dispatch(Event.MAP_ENTITIES_LOADED, { entry: mapEntry })
    }

    loadNextEntryBatch(mapEntry){
        let _this = this;
        let len = this.partialLoad.length;
        if (len === 0) return false;

        let processEntries = 3;

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

            result.props.instance = entity.inst;
            result.props.glgEntry = entity.glgEntry;

            result.level = mapEntry.level;
            result.gameId = mapEntry.gameId;

            Storage.add(result);


            if (len - i - 1 === 0){
                Status.hide();
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