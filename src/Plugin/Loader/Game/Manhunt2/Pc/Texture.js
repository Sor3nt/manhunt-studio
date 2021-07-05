import AbstractLoader from "./../../../Abstract.js";
import Result from "../../../Result.js";
import NBinary from "../../../../../NBinary.js";

export default class Texture extends AbstractLoader{
    static name = "Texture (Manhunt 2 PC)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //PMLC
        return AbstractLoader.checkFourCC(binary,1413759828);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];

        binary.seek(8 * 4);
        let count = binary.consume(4, 'uint32');
        let currentOffset = binary.consume(4, 'uint32');

        while(count--){
            let nextOffset = binary.consume(4, 'uint32');
            binary.seek(4);
            let name = binary.consume(32, 'nbinary').getString(0, false);


            (function (offset, name) {
                results.push(new Result(
                    Studio.TEXTURE,
                    name,
                    offset,
                    {},
                    function(){
                        binary.setCurrent(offset);

                        return MANHUNT.converter.dds2texture(
                            Texture.parseTexture(binary)
                        );
                    }
                ));
            })(currentOffset, name);

            currentOffset = nextOffset;
            if (currentOffset === 36) break;

        }

        return results;
    }

    static parseTexture( binary ){

        let texture = {
            'nextOffset'        : binary.consume(4, 'int32'),
            'prevOffset'        : binary.consume(4, 'int32'),
            'name'              : binary.consume(32, 'nbinary').getString(0, false),
            'alphaFlags'        : binary.consume(32, 'dataview'),
            'width'             : binary.consume(4, 'int32'),
            'height'            : binary.consume(4, 'int32'),
            'bitPerPixel'       : binary.consume(4, 'int32'),
            'pitchOrLinearSize' : binary.consume(4, 'int32'),
            'flags'             : binary.consume(4,  'dataview'),
            'mipMapCount'       : binary.consume(1,  'int8'),
            'unknown'           : binary.consume(3,  'dataview'),
            'dataOffset'        : binary.consume(4, 'int32'),
            'paletteOffset'     : binary.consume(4, 'int32'),
            'size'              : binary.consume(4, 'int32'),
            'unknown2'          : binary.consume(4, 'dataview')
        };

        binary.setCurrent(texture.dataOffset);

        texture.data = binary.consume(texture['size'], 'arraybuffer');
        return texture;
    }

}