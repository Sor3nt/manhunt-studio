import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import Event from "../../Event.js";
import Storage from "../../Storage.js";
import NormalizeModel from "../Loader/Renderware/Utils/NormalizeModel.js";

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
                let normalizedModel = new NormalizeModel(entry.data());

                let object = normalizedModel.getObjects()[0];

                result.push({
                    label: '&nbsp;',
                    value: entry.file
                });

                result.push({
                    label: 'Skinned',
                    value: object.skinning ? 'Yes' : 'No'
                });

                result.push({
                    label: 'Vertex Count',
                    value: normalizedModel.data.vertexCount
                });

                let materialInfo = jQuery('<ul>').addClass('material');
                object.material.forEach(function (name) {
                    (function (name) {

                        materialInfo.append(jQuery('<li>').append(jQuery('<span>').html(name).click(function () {

                            let texture = Storage.findBy({
                                type: Studio.TEXTURE,
                                gameId: entry.gameId,
                                name: name
                            })[0];

                            Event.dispatch(Event.OPEN_ENTRY, { entry: texture });

                        })));
                    })(name);
                });

                result.push({
                    label: 'Material',
                    value: materialInfo
                });


                // console.log(normalizedModel, object);

                break;
            case Studio.TEXTURE:
                /**
                 * @type {NormalizedTexture}
                 */
                let data = entry.data();

                result.push({
                    label: 'Dimensions',
                    value: data.texture.width + 'x' + data.texture.height
                });

                //TODO: die info sollte aus einer texture class kommen und nicht hier bestimmt werden
                // switch (data.info.rasterFormat & 0xf00) {
                //     case Renderware.RASTER_565:
                //         result.push({
                //             label: 'Format',
                //             value: 'DXT 1 (RGBA)'
                //         });
                //         break;
                //     case Renderware.RASTER_1555:
                //         result.push({
                //             label: 'Format',
                //             value: 'DXT 1 (RGB)'
                //         });
                //
                //         break;
                //     case Renderware.RASTER_4444:
                //         result.push({
                //             label: 'Format',
                //             value: 'DXT 2'
                //         });
                //
                //         break;
                //     default:
                //         result.push({
                //             label: 'Format',
                //             value: 'Unknown ' + (data.info.rasterFormat & 0xf00)
                //         });
                // }

                break;

        }

        let container = jQuery('<ul>');
        result.forEach(function (info) {
            let li = jQuery('<li>');
            li.append(jQuery('<span>').append(info.label));
            li.append(jQuery('<div>').append(info.value));
            container.append(li);
        });

        this.element.html('').append(container);
    }

}