import Event from "./../Event.js";
import {default as GlgEditorComponent} from "../Plugin/Component/GlgEditor.js";
import Studio from "../Studio.js";

export default class GlgEditor {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.section = section;

        let _this = this;
        Event.on(Event.VIEW_ENTRY, function (props) {
            if (props.entry.type !== Studio.MODEL) return;

            _this.setEntry(props.entry);
        });

        this.component = new GlgEditorComponent({});
        this.section.add(this.component);

    }

    /**
     * @param entry {Result}
     */
    setEntry(entry){
        this.component.setEntry(entry);
    }

}