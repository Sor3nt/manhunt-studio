import AbstractLoader from "./Abstract.js";
import Renderware from "./Renderware/Renderware.js";
import Result from "./Result.js";
import Studio from "./../../Studio.js";
import Helper from "./../../Helper.js";
import TexDictionary from "./Renderware/Chunk/TexDictionary.js";
import TextureNative from "./Renderware/Chunk/TextureNative.js";

import NormalizeMap from "./../../Normalize/map.js";
import NormalizeModel from "./../../Normalize/model.js";
import NormalizeTexture from "./../../Normalize/texture.js";


export default class RenderwareLoader extends AbstractLoader{
    static name = "Renderware";

    static canHandle(binary){
        if (binary.length() <= 12) return false;

        let current = binary.current();
        console.log(current,binary);
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
                                binary.setCurrent(offset);
                                let tree = Renderware.parse(binary);
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
                    // binary.setCurrent(current);

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

                                    return new NormalizeTexture(texNative.result);
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

        console.log("end");

        return results;
    }

}