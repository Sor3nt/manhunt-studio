import AbstractLoader from "../Abstract.js";
import Result from "../Result.js";
import {NormalizedTexture} from "../../../Normalize/texture.js";
import Studio from "../../../Studio.js";

export default class DDS extends AbstractLoader{
    static name = "Texture (DDS)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //DDS
        return AbstractLoader.checkFourCC(binary,542327876);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];
        results.push(new Result(
            Studio.TEXTURE,
            "unknown",
            binary,
            0,
            {},
            function(){
                binary.setCurrent(0);

                return new NormalizedTexture(
                    binary.data,
                    null,
                    null,
                    null,
                    null,
                    null,
                    NormalizedTexture.FORMAT_DDS,
                    false
                );

            }
        ));

        return results;
    }


}