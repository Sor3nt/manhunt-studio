import Event from "./../Event.js";
import Studio from "./../Studio.js";
import { default as ModelComponent} from "./../Plugin/Component/Model.js";

export default class Model {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.section = section;
        this.models = {};

        let _this = this;
        Event.on(Event.OPEN_ENTRY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.MODEL) return;
            _this.displayEntry(entry);
        });
    }

    getActiveModelMesh() {
        let name = this.section.tabNavigation.activeRelationName;
        if (name === null)
            return null;

        if (this.models[name] === undefined)
            return null;

        return this.models[name].mesh;
    }


    /**
     * @param entry {Result}
     */
    displayEntry(entry){
        if (this.models[entry.name] === undefined){
            this.models[entry.name] = new ModelComponent({ entry: entry });
            this.models[entry.name].displayName = entry.name;
            this.section.add(this.models[entry.name]);
        }

        this.section.tabNavigation.show(entry.name);
    }
}