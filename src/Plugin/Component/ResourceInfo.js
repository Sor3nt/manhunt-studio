import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import Event from "../../Event.js";
import Storage from "../../Storage.js";
import Games from "../../Plugin/Games.js";
import StudioScene from "../../Scene/StudioScene.js";
import Result from "../Loader/Result.js";

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
console.log("CLICK", entry);
        let result = [];
        let object;
        let materialInfo;
        let normalizedModel;
        switch (entry.type) {

            case Studio.AREA_LOCATION:

                result.push({
                    label: '',
                    value: `<span>Clear</span>`,
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                            /**
                             * @type {SceneMap}
                             */
                            let studioScene = StudioScene.getStudioSceneInfo().studioScene;

                            studioScene.waypoints.clear();
                        });
                    }
                });

                result.push({
                    label: '',
                    value: `<span>create</span>`,
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                            /**
                             * @type {SceneMap}
                             */
                            let studioScene = StudioScene.getStudioSceneInfo().studioScene;


                            let newNode = new Result(
                                Studio.AREA_LOCATION,
                                `ai`,
                                '',
                                0,
                                {

                                },
                                function () {
                                    console.error("HMMM TODO");
                                    debugger;
                                }
                            );

                            studioScene.waypoints.createNode(newNode);


                            // studioScene.waypoints.createNewNode();
                        });
                    }
                });

                result.push({
                    label: 'Mesh',
                    value: `<span>GEN</span>`,
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                            /**
                             * @type {SceneMap}
                             */
                            let studioScene = StudioScene.getStudioSceneInfo().studioScene;

                            studioScene.waypoints.generateMeshByEntity(entry);
                        });
                    }
                });

                result.push({
                    label: 'Route',
                    value: `<span>GEN</span>`,
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                            /**
                             * @type {SceneMap}
                             */
                            let studioScene = StudioScene.getStudioSceneInfo().studioScene;

                            studioScene.waypoints.generateRoutes();
                        });
                    }
                });


                break;
            case Studio.ENTITY:

                let game = Games.getGame(entry.gameId);

                let record = game.findOneBy({
                    type: Studio.GLG,
                    level: entry.level,
                    name: entry.props.instance.props.glgRecord
                });

                if (record.props.model !== false){
                    let model = game.findOneBy({
                        type: Studio.MODEL,
                        level: entry.level,
                        name: record.props.model
                    });


                    /**
                     * @type {NormalizeModel}
                     */
                    normalizedModel = model.props.normalize();

                    object = normalizedModel.getObjects()[0];

                    result.push({
                        label: 'Model',
                        value: model.name
                    });
                }

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
                    value: `
<span class="badge badge-secondary">x</span>:<input name="x" value="${object.position.x.toFixed(2)}" style="width: 40px;" /> 
<span class="badge badge-secondary">y</span>:<input name="y" value="${object.position.y.toFixed(2)}" style="width: 40px;" />
<span class="badge badge-secondary">z</span>:<input name="z" value="${object.position.z.toFixed(2)}" style="width: 40px;" />
`,
                    /**
                     * @param element {jQuery}
                     */
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                            navigator.clipboard.writeText(`{
    "x": ${object.position.x.toFixed(2)},
    "y": ${object.position.z.toFixed(2) * -1},
    "z": ${object.position.y.toFixed(2)}
}`);
                        });

                        element.find('input').keyup(function (e) {

                            let attr = jQuery(e.target).attr('name');
                            let value = parseFloat(jQuery(e.target).val());

                            if (attr === "x")
                                object.position.x = value;
                            if (attr === "y")
                                object.position.y = value;
                            if (attr === "z")
                                object.position.z = value;

                        });

                    }
                });

                result.push({
                    label: 'Rotation',
                    value: `<span class="badge badge-secondary">x</span>:${object.rotation.x.toFixed(2)} <span class="badge badge-secondary">y</span>:${object.rotation.y.toFixed(2)} <span class="badge badge-secondary">z</span>:${object.rotation.z.toFixed(2)} `,
                    postprocess: function ( element ) {
                        element.find('span').click(function () {

                        navigator.clipboard.writeText(`{
    "x": ${object.quaternion.x.toFixed(2)},
    "y": ${object.quaternion.z.toFixed(2)},
    "z": ${object.quaternion.y.toFixed(2) * -1},
    "w": ${object.quaternion.w.toFixed(2)},
}`);
                        });
                    }
                });


                switch (record.props.getValue('CLASS')) {
                    case 'EC_TRIGGER':
                        result.push({
                            label: 'Radius',
                            value: `${entry.props.instance.data().settings.radius}`
                        });
                        break;
                }
                break;
            case Studio.MODEL:

                /**
                 * @type {NormalizeModel}
                 */
                normalizedModel = entry.props.normalize();

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
            if (info.onClick !== undefined)
                li.click(info.onClick);

            if (info.postprocess !== undefined)
                info.postprocess(li);

            container.append(li);
        });

        this.element.html('').append(container);
    }

}