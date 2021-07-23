import AbstractLoader from "./Abstract.js";
import Renderware from "./Renderware/Renderware.js";
import Result from "./Result.js";
import Studio from "./../../Studio.js";
import Helper from "./../../Helper.js";
import TexDictionary from "./Renderware/Chunk/TexDictionary.js";
import TextureNative from "./Renderware/Chunk/TextureNative.js";

import NormalizeMap from "./../../Normalize/map.js";
// import NormalizeTexture from "./../../Normalize/texture.js";
import Status from "../../Status.js";
import {RGBAFormat, RGBFormat} from "../../Vendor/three.module.js";
import NormalizeModel from "./Renderware/Utils/NormalizeModel.js";
import DXT from "../../Helper/Texture/DXT.js";
import {NormalizedTexture} from "./../../Normalize/texture.js";


export default class RenderwareLoader extends AbstractLoader{
    static name = "Renderware";

    static canHandle(binary){
        if (binary.length() <= 12) return false;

        let current = binary.current();
        let header = Renderware.parseHeader(binary);
        binary.setCurrent(current);

        switch (header.id) {
            case Renderware.CHUNK_TOC:
            case Renderware.CHUNK_WORLD:
            case Renderware.CHUNK_CLUMP:
            case Renderware.CHUNK_TEXDICTIONARY:
                return true;
        }

        return false;
    }

    static list(binary, options){

        let results = [];
        while(binary.remain() > 0){
            let current = binary.current();
            let header = Renderware.parseHeader(binary);

            switch (header.id) {

                case Renderware.CHUNK_WORLD:
                    (function (offset) {

                        results.push(new Result(
                            Studio.MAP,
                            "scene",
                            offset,
                            {},
                            function(){
                                Status.set(`Parse Map Data`);
                                binary.setCurrent(offset);
                                let tree = Renderware.parse(binary);

                                Status.set(`Normalize Map Data`);
                                return new NormalizeMap(tree);
                            }
                        ));

                    })(current);


                    break;
                case Renderware.CHUNK_CLUMP:
                    binary.setCurrent(current);
                    let list = Renderware.readClumpList(binary);

                    list.forEach(function (info) {

                        results.push(new Result(
                            Studio.MODEL,
                            info.name,
                            info.offset,
                            {},
                            function(){
                                binary.setCurrent(info.offset);
                                let tree = Renderware.parse(binary);
                                return new NormalizeModel(tree.rootData);
                            }
                        ));

                    });

                    //note: readClumpList will return all names we we have only one loop and no next offset
                    if (binary.remain() === 0)
                        return results;

                    break;

                case Renderware.CHUNK_TEXDICTIONARY:

                    (function (binary) {

                        let texDic = new TexDictionary(binary, header, {});

                        texDic.list().forEach(function (info) {

                            results.push(new Result(
                                Studio.TEXTURE,
                                info.name,
                                info.offset,
                                {},
                                function(){
                                    binary.setCurrent(info.offset);

                                    let chunk = Renderware.parseHeader(binary);
                                    Helper.assert(chunk.id, Renderware.CHUNK_TEXTURENATIVE);

                                    let texNative = new TextureNative(binary, chunk, {});
                                    texNative.parse();
                                    let normalizeFormat = null;
                                    let platform = null;

                                    if (texNative.result.platform === Renderware.PLATFORM_XBOX){
                                        platform = "xbox";

                                        // texNative.convertTo32Bit();
                                        // DXT.decompressDxt4(texNative.texture);
                                        normalizeFormat = 33776;

                                        // die;
                                    }else{
                                        platform = "pc";

                                        switch ( texNative.result.rasterFormat & Renderware.RASTER_MASK ) {

                                            case Renderware.RASTER_565:
                                                normalizeFormat = NormalizedTexture.FORMAT_BC1_RGBA;
                                                break;

                                            case Renderware.RASTER_1555:
                                                normalizeFormat = NormalizedTexture.FORMAT_BC1_RGB;
                                                break;

                                            case Renderware.RASTER_4444:
                                                normalizeFormat = NormalizedTexture.FORMAT_BC2_RGBA;
                                                break;

                                            default:
                                                normalizeFormat = NormalizedTexture.FORMAT_BC1_RGBA;
                                                // console.error("decode not dxt", texture.rasterFormat & 0xf00);
                                                debugger;
                                        }

                                    }

                                    return new NormalizedTexture(
                                        texNative.texture.mipmaps[0].data,
                                        null,
                                        texNative.texture.width,
                                        texNative.texture.height,
                                        texNative.result.depth,
                                        platform, //todo
                                        normalizeFormat,
                                        false
                                    );

                                }
                            ));

                        });
                    })(binary);

                    break;

                default:
                    console.error('Unknown Renderware Chunk given');
                    debugger;
                    break;

            }

            binary.setCurrent(current + 12 + header.size);

        }

        return results;
    }

}