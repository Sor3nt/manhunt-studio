import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import Event from "../../Event.js";
import Storage from "../../Storage.js";
import NormalizeModel from "../Loader/Renderware/Utils/NormalizeModel.js";
import StudioScene from "../../Scene/StudioScene.js";

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
     *
     * @param entry {Result}
     */
    generateModelInfo(entry, result){


    }

    /**
     * @param entry {Result}
     */
    setEntry(entry){

        let result = [];
        let object;
        let materialInfo;
        let normalizedModel;
        switch (entry.type) {

            case Studio.ENTITY:

                let record = Storage.findOneBy({
                    type: Studio.GLG,
                    level: entry.level,
                    gameId: entry.gameId,
                    name: entry.props.instance.props.glgRecord
                });

                let model = Storage.findOneBy({
                    type: Studio.MODEL,
                    level: entry.level,
                    gameId: entry.gameId,
                    name: record.props.model,
                });


                /**
                 * @type {NormalizeModel}
                 */
                normalizedModel = new NormalizeModel(model.data());

                object = normalizedModel.getObjects()[0];

                result.push({
                    label: 'Model',
                    value: model.name
                });

                result.push({
                    label: 'Instance',
                    value: entry.name
                });

                result.push({
                    label: 'Record',
                    value: record.name
                });


                object = StudioScene.getStudioSceneInfo().scene.getObjectByName(entry.name);
                result.push({
                    label: 'Position',
                    value: `<span class="badge badge-secondary">x</span>:${object.position.x.toFixed(2)} <span class="badge badge-secondary">y</span>:${object.position.y.toFixed(2)} <span class="badge badge-secondary">z</span>:${object.position.z.toFixed(2)} `
                });

                result.push({
                    label: 'Rotation',
                    value: `<span class="badge badge-secondary">x</span>:${object.rotation.x.toFixed(2)} <span class="badge badge-secondary">y</span>:${object.rotation.y.toFixed(2)} <span class="badge badge-secondary">z</span>:${object.rotation.z.toFixed(2)} `
                });
                break;
            case Studio.MODEL:

                /**
                 * @type {NormalizeModel}
                 */
                normalizedModel = new NormalizeModel(entry.data());

                object = normalizedModel.getObjects()[0];

                result.push({
                    label: '&nbsp;',
                    value: entry.file
                });

                result.push({
                    label: 'Name',
                    value: entry.name
                });

                result.push({
                    label: 'Skinned',
                    value: object.skinning ? 'Yes' : 'No'
                });

                result.push({
                    label: 'Vertex Count',
                    value: normalizedModel.data.vertexCount
                });

                materialInfo = jQuery('<ul>').addClass('material');
                object.material.forEach(function (name) {
                    (function (name) {

                        materialInfo.append(jQuery('<li>').append(jQuery('<span>').html(name).click(function () {

                            let texture = Storage.findBy({
                                type: Studio.TEXTURE,
                                level: entry.level,
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