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
            let skipSize = binary.current() + 120;

            let name = binary.getString(0, false);


            (function (offset, name) {
                results.push(new Result(
                    Studio.TEXTURE,
                    name,
                    offset,
                    {},
                    function(){
                        binary.setCurrent(offset);

                        let pixelDataOffset = binary.consume(4, 'uint32', false);
                        binary.seek(4); //unk

                        let pixelDataSize = binary.consume(4, 'uint32');
                        binary.setCurrent(pixelDataOffset);
                        binary.seek(4); // chunkFlag

                        let numHeader = binary.consume(4, 'uint32',false);
                        binary.seek(4); //unk

                        let info = [];
                        for(let i = 0; i < numHeader; i++){
                            let headerOffset = binary.consume(4, 'uint32',false);
                            headerOffset += pixelDataOffset;
                            binary.seek(4); //unk

                            let nextOfs = binary.current();
                            binary.setCurrent(headerOffset);

                            info.push({
                                height: binary.consume(2, 'uint16', false),
                                width: binary.consume(2, 'uint16', false),
                                texFormat: binary.consume(4, 'uint32',false),
                                pixelOffset: binary.consume(4, 'uint32',false),
                            });

                            binary.setCurrent(nextOfs);
                        }

                        let textures = [];

                        for(let i = 0; i < numHeader; i++){
                            let singleDataSize;

                            if (numHeader === 2){
                                if (i === 0){
                                    singleDataSize = info[i+1].pixelOffset - info[i].pixelOffset;
                                }else{
                                    singleDataSize = pixelDataSize -  info[i].pixelOffset;
                                }
                            } else{
                                singleDataSize = pixelDataSize - info[i].pixelOffset;
                            }

                            binary.setCurrent(pixelDataOffset + info[i].pixelOffset);

                            let data = binary.consume(singleDataSize , 'dataview');
                            data = Texture.unswizzle(data, info[i].width, info[i].height);
                            data = Helper.dxt().decodeBC1(data, info[i].width, info[i].height, false, false);
                            data = Texture.flipBlocks(data);

                            textures.push({
                                width: info[i].width,
                                height: info[i].height,
                                data: data,
                            });
                        }

                        return new NormalizeTexture({
                            mipmaps: [ { data: new Uint8Array(textures[0].data), width: textures[0].width, height: textures[0].height }],
                            width: textures[0].width,
                            height: textures[0].height,
                            alphaMap: textures.length === 2 ? textures[1] : null,
                            format: RGBAFormat
                        });
                    }
                ));
            })(skipSize, name);

            currentOffset = nextOffset;
            if (currentOffset === 36) break;

        }

        return results;
    }

    static flipBlocks(data){

        /**
         * Flip 4x4 blocks
         */
        let rgbaNew = [];
        let rgbaBlocks = [];

        let pixels = [] ;

        let chunk = 4;
        for (let i = 0,j = data.byteLength; i < j; i += chunk) {
            pixels.push(data.slice(i, i + chunk))
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

    static unswizzle(data, width, height ){
        let result = new ArrayBuffer(data.byteLength);
        let view = new DataView(result);

        let BlocksPerW = width / 8;
        let BlocksPerH = height / 8;

        for (let h = 0; h < BlocksPerH; h++){
            for (let w = 0; w < BlocksPerW; w++) {
                for (let BlocksPerRow = 0; BlocksPerRow < 2; BlocksPerRow++) {
                    let swizzled = h * BlocksPerW * 32 + w * 32 + BlocksPerRow * 16;
                    let unswizzled = h * BlocksPerW * 32 + w * 16 + BlocksPerRow * BlocksPerW * 16;

                    for (let n = 0; n < 16; n++){
                        view.setUint8(unswizzled + n, data.getUint8(swizzled + n) );
                    }
                }
            }

        }

        return view;
    }
}