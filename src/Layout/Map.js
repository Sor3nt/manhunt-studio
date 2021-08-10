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
        this.section = section;

        let _this = this;
        Event.on(Event.OPEN_ENTRY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.MAP) return;
            _this.displayEntry(entry);
        });

        Event.on(Event.MAP_FOCUS_ENTITY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.ENTITY) return;
            _this.focusEntry(entry);
        });
    }

    /**
     * @param entry {Result}
     */
    focusEntry(entry){
        /**
         * @type {SceneMap}
         */

        let studioScene = this.model.studioScene;
        // studioScene.
        let sceneEntity = studioScene.sceneInfo.scene.getObjectByName(entry.name);

        console.log("sceneEntity", sceneEntity);
        studioScene.sceneInfo.control.setObject(sceneEntity);
        studioScene.sceneInfo.control.setMode('transform');
        studioScene.sceneInfo.control.keyStates.modeSelectObject = true; //note: inverted...

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
                Status.hide();
            });
        });

    }

    #_displayEntry(entry){

        this.createEntities(entry);

        //todo: das stimmt hier nicht, wir laden ja immer neu auch wenn der tab bereits offen ist...

        this.model = new MapComponent({ entry: entry });
        this.model.displayName = entry.name;
        this.section.add(this.model);
        this.section.tabNavigation.show(this.model.displayName);
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

        let instEntries = Storage.findBy({
            type: Studio.INST,
            level: mapEntry.level,
            gameId: mapEntry.gameId
        });

        instEntries.forEach(function (inst) {
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

            result.props.instance = inst;

            result.level = mapEntry.level;
            result.gameId = mapEntry.gameId;
// debugger;
            Storage.add(result);

        });

        Event.dispatch(Event.MAP_ENTITIES_LOADED, { entry: mapEntry })
    }

}