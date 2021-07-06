import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import NormalizeTexture from "../../Normalize/texture.js";

export default class ResourceInfo extends AbstractComponent{

    name = "info";
    displayName = "Resource Info";

    /**
     * @param props {{}}
     */
    constructor(props) {
        super(props);
    }

    /**
     * @param entry {Result}
     */
    setEntry(entry){

        let result = [];

        switch (entry.type) {

            case Studio.TEXTURE:
                /**
                 * @type {NormalizeTexture}
                 */
                let data = entry.getData();
                result.push({
                    label: 'Dimensions',
                    value: data.texture.width + 'x' + data.texture.height
                });
                break;

        }

        let container = jQuery('<ul>');
        result.forEach(function (info) {
            let li = jQuery('<li>');
            li.append(jQuery('<span>').html(info.label));
            li.append(info.value);
            container.append(li);
        });

        this.element.html('').append(container);
    }

}