import Event from "./../Event.js";
import {default as ResourceInfoComponent} from "../Plugin/Component/ResourceInfo.js";

export default class ResourceInfo {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.section = section;
        // this.textureInfo = new TextureInfo({});

        let _this = this;
        Event.on(Event.VIEW_ENTRY, function (props) {
            _this.setEntry(props.entry);
        });

        this.component = new ResourceInfoComponent({});
        this.section.add(this.component);

    }

    /**
     * @param entry {Result}
     */
    setEntry(entry){
        this.component.setEntry(entry);
    }

}