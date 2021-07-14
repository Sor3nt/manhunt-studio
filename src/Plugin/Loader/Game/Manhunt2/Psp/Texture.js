import AbstractLoader from "./../../../Abstract.js";
import Result from "../../../Result.js";
import NBinary from "../../../../../NBinary.js";
import Studio from "../../../../../Studio.js";
import NormalizeTexture from "../../../../../Normalize/texture.js";
import Playstation from "../../../../../Helper/Texture/Playstation.js";
import {RGBAFormat} from "../../../../../Vendor/three.module.js";

export default class Texture extends AbstractLoader{
    static name = "Texture (Manhunt 2 PSP/PS2)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //TCDT
        let fourCCCheck = AbstractLoader.checkFourCC(binary,1413759828);
        if (fourCCCheck === false) return false;

        if (binary.length() <= 196)
            return false;

        binary.seek(192);
        //not DDS
        return binary.consume(4, 'uint32') !== 542327876;
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];

        binary.seek(32);
        let count = binary.consume(4, 'uint32');
        let currentOffset = binary.consume(4, 'uint32');

        while(count--){
            binary.setCurrent(currentOffset);
            let nextOffset = binary.consume(4, 'uint32');
            binary.seek(4); //prev offset
            let name = binary.getString(0, false);

            binary.setCurrent(currentOffset + 72);

            (function (offset, name) {

                results.push(new Result(
                    Studio.TEXTURE,
                    name,
                    offset,
                    {},
                    function(){
                        binary.setCurrent(offset);

                        let texture = {
                            width: binary.consume(4, 'uint32'),
                            height: binary.consume(4, 'uint32'),
                            bitPerPixel: binary.consume(4, 'uint32'),
                            rasterFormat: binary.consume(4, 'uint32'),
                            pixelFormat: binary.consume(4, 'uint32'),
                            numMipLevels: binary.consume(1, 'uint8'),
                            swizzleMask: binary.consume(1, 'uint8'),
                            pPixel: binary.consume(1, 'uint8'),
                            renderPass: binary.consume(1, 'uint8'),
                            dataOffset: binary.consume(4, 'uint32'),
                            paletteOffset: binary.consume(4, 'uint32')
                        };

                        let paletteSize = Playstation.getPaletteSize(texture.rasterFormat, texture.bitPerPixel);
                        let dataSize = Playstation.getRasterSize(texture.rasterFormat, texture.width, texture.height, texture.bitPerPixel);

                        binary.setCurrent(texture.paletteOffset);
                        texture.palette = binary.consume(paletteSize, 'nbinary');

                        binary.setCurrent(texture.dataOffset);
                        texture.data = binary.consume(dataSize, 'nbinary');

                        /**
                         * WARNING: this is a workaround!!!
                         * Issue: PSP and PS2 share the same struct but PS2 require palette unswizzle
                         *        There is no flag which tell us if the file is PSP or PS2.
                         *        So far known PSP always has only one MipMap and PS2 at least 2!
                         */
                        let platform = "ps2";
                        if (texture.numMipLevels === 1){
                            platform = "psp";
                        }

                        let rgba = Playstation.convertToRgba(texture, platform);

                        return new NormalizeTexture({
                            mipmaps: [ { data: new Uint8Array(rgba), width: texture.width, height: texture.height }],
                            width: texture.width,
                            height: texture.height,
                            format: RGBAFormat
                        });
                    }
                ));
            })(currentOffset + 72, name);

            currentOffset = nextOffset;
            if (currentOffset === 36) break;

        }

        return results;
    }


}