import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import NormalizeTexture from "../../Normalize/texture.js";
import Renderware from "../Loader/Renderware/Renderware.js";

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

            case Studio.MODEL:

                /**
                 * @type {NormalizeModel}
                 */
                let normalizedModel = entry.getData();

                let object = normalizedModel.getObjects()[0];


                result.push({
                    label: 'Skinned',
                    value: object.skinning ? 'Yes' : 'No'
                });
                // console.log(normalizedModel, object);

                break;
            case Studio.TEXTURE:
                /**
                 * @type {NormalizeTexture}
                 */
                let data = entry.getData();

                result.push({
                    label: 'Dimensions',
                    value: data.texture.width + 'x' + data.texture.height
                });

                switch (data.info.rasterFormat & 0xf00) {
                    case Renderware.RASTER_565:
                        result.push({
                            label: 'Format',
                            value: 'DXT 1'
                        });
                        break;
                    case Renderware.RASTER_1555:
                        result.push({
                            label: 'Format',
                            value: 'DXT 1'
                        });

                        break;
                    case Renderware.RASTER_4444:
                        result.push({
                            label: 'Format',
                            value: 'DXT 2'
                        });

                        break;
                    default:
                        result.push({
                            label: 'Format',
                            value: 'Unknown ' + (data.info.rasterFormat & 0xf00)
                        });
                }



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