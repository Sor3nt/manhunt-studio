import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as MapComponent} from "./../Plugin/Component/Map.js";
import Status from "../Status.js";
import Storage from "../Storage.js";
import Entity from "../Entity.js";
import Result from "../Plugin/Loader/Result.js";

export default class Map {

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

        this.model = new MapComponent({ entry: entry });
        this.model.displayName = entry.name;
        this.section.add(this.model);
        this.section.tabNavigation.show(this.model.displayName);


    }


    /**
     * Create Game-Entities
     * Each entity represents a object in the 3d world.
     */
    createEntities(entry){
        // let gameId = this.gameId;

        let instEntries = Storage.findBy({
            type: Studio.INST,
            level: entry.level,
            gameId: entry.gameId
        });

        instEntries.forEach(function (inst) {
            let entity = new Entity(entry, inst);
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

            result.level = entry.level;
            result.gameId = entry.gameId;
// debugger;
            Storage.add(result);

        });
    }

}