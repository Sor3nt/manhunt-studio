import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as MapComponent} from "./../Plugin/Component/Map.js";
import Status from "../Status.js";

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

        this.model = new MapComponent({ entry: entry });
        this.model.displayName = entry.name;
        this.section.add(this.model);
        this.section.tabNavigation.show(this.model.displayName);
    }
}