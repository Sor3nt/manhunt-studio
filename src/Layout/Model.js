import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as ModelComponent} from "./../Plugin/Component/Model.js";

export default class Model {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.section = section;

        let _this = this;
        Event.on(Event.OPEN_ENTRY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.MODEL) return;
            _this.displayEntry(entry);
        });
    }

    /**
     * @param entry {Result}
     */
    displayEntry(entry){
        this.model = new ModelComponent({ entry: entry });
        this.section.add(this.model);
    }
}