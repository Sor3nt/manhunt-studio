import AbstractLoader from "./../../../Abstract.js";
import Result from "../../../Result.js";
import NBinary from "../../../../../NBinary.js";
import Studio from "../../../../../Studio.js";
import NormalizeTexture from "../../../../../Normalize/texture.js";
import {RGBAFormat} from "../../../../../Vendor/three.module.js";
import Helper from "../../../../../Helper.js";

export default class Texture extends AbstractLoader{
    static name = "Texture (Manhunt 2 Wii)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //TDCT
        return AbstractLoader.checkFourCC(binary,1413694548);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];

        binary.seek(32);
        let count = binary.consume(4, 'uint32', false);
        let currentOffset = binary.consume(4, 'uint32', false);

        while(count--){
            binary.setCurrent(currentOffset);
            let nextOffset = binary.consume(4, 'uint32', false);
            binary.seek(4); //prev offset
            let name = binary.getString(0, false);

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
                            dataOffset: binary.consume(4, 'uint32', false),
                            unk: binary.consume(4, 'uint32'),
                            dataSize: binary.consume(4, 'uint32')
                        };

                        binary.setCurrent(texture.dataOffset);
                        binary.seek(4);

                        let numHeader = binary.consume(4, 'uint32',false);
                        //
                        // binary.seek(12);
                        // if (numHeader === 2){
                        //     binary.seek(8);
                        // }
                        // binary.seek(4); //height and width


                        //TODO MIPMAPS
                        
                        binary.seek(12);
                        if (numHeader > 1){
                            binary.seek(numHeader * 4);
                        }

                        texture.height = binary.consume(2, 'uint16', false);
                        texture.width = binary.consume(2, 'uint16', false);

                        binary.setCurrent(texture.dataOffset + (64 * numHeader));
                        texture.data = binary.consume(texture.dataSize , 'dataview');

                        texture.data = Texture.unswizzle(texture);
                        texture.data = Helper.dxt().decodeBC1(texture.data, texture.width, texture.height, false, false);
                        texture.data = Texture.flipBlocks(texture);

                        return new NormalizeTexture({
                            mipmaps: [ { data: new Uint8Array(texture.data), width: texture.width, height: texture.height }],
                            width: texture.width,
                            height: texture.height,
                            format: RGBAFormat
                        });
                    }
                ));
            })(currentOffset + 104, name);

            currentOffset = nextOffset;
            if (currentOffset === 36) break;

        }

        return results;
    }

    static flipBlocks(texture){

        /**
         * Flip 4x4 blocks
         */
        let rgbaNew = [];
        let rgbaBlocks = [];

        let pixels = [] ;

        let chunk = 4;
        for (let i = 0,j = texture.data.byteLength; i < j; i += chunk) {
            pixels.push(texture.data.slice(i, i + chunk))
        }

        let current = 0;
        while (current < pixels.length){
            rgbaBlocks.push(pixels[current + 3]);
            rgbaBlocks.push(pixels[current + 2]);
            rgbaBlocks.push(pixels[current + 1]);
            rgbaBlocks.push(pixels[current]);

            current += 4;
        }

        //flat result
        rgbaBlocks.forEach(function (rgbaBlock) {
            rgbaBlock.forEach(function (color) {
                rgbaNew.push(color);
            })
        });

        return rgbaNew;
    }

    static unswizzle(texture ){
        let result = new ArrayBuffer(texture.data.byteLength);
        let view = new DataView(result);

        let BlocksPerW = texture.width / 8;
        let BlocksPerH = texture.height / 8;

        for (let h = 0; h < BlocksPerH; h++){
            for (let w = 0; w < BlocksPerW; w++) {
                for (let BlocksPerRow = 0; BlocksPerRow < 2; BlocksPerRow++) {
                    let swizzled = h * BlocksPerW * 32 + w * 32 + BlocksPerRow * 16;
                    let unswizzled = h * BlocksPerW * 32 + w * 16 + BlocksPerRow * BlocksPerW * 16;

                    for (let n = 0; n < 16; n++){
                        view.setUint8(unswizzled + n, texture.data.getUint8(swizzled + n) );
                    }
                }
            }

        }

        return view;
    }
}