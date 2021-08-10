import Event from "./../Event.js";
import { default as TextureComponent} from "./../Plugin/Component/Texture.js";
import Studio from "../Studio.js";
// import TextureInfo from "../Plugin/Component/TextureInfo.js";

export default class Texture {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.textures = {};
        this.section = section;
        // this.textureInfo = new TextureInfo({});

        let _this = this;
        Event.on(Event.OPEN_ENTRY, function (props) {
            /** @type {Result}  */
            let entry = props.entry;
            if (entry.type !== Studio.TEXTURE) return;

            _this.displayEntry(entry);
        });
    }

    /**
     * @param entry {Result}
     */
    displayEntry(entry){

        if (this.textures[entry.name] === undefined){
            this.textures[entry.name] = new TextureComponent({ entry: entry });
            this.textures[entry.name].displayName = entry.name;

            this.section.add(this.textures[entry.name]);
        }

        this.section.tabNavigation.show(entry.name);
    }

}