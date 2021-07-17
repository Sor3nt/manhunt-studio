import AbstractLoader from "./../../../Abstract.js";
import Result from "../../../Result.js";
import NBinary from "../../../../../NBinary.js";
import Studio from "../../../../../Studio.js";
import NormalizeTexture from "../../../../../Normalize/texture.js";
import {RGBAFormat} from "../../../../../Vendor/three.module.js";
import Helper from "../../../../../Helper.js";

/**
 * @Credits: https://github.com/leeao/Noesis-Plugins/blob/6a0447bb9369efdbca95111b38155f1263ec5fb2/Textures/tex_Manhunt2_Wii_txd.py
 */

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

                            /**
                             *     decoder,                        bpp, block width, block height, bSimple, palette len
                             0x00: ("i4",     pixelParser.i4,        4, 8, 8, True,  0),
                             0x01: ("i8",     pixelParser.i8,        8, 8, 4, True,  0),
                             0x02: ("ia4",    pixelParser.ia4,       8, 8, 4, True,  0),
                             0x03: ("ia8",    pixelParser.ia8,      16, 4, 4, True,  0),
                             0x04: ("rgb565", pixelParser.rgb565,   16, 4, 4, True,  0),
                             0x05: ("rgb5a3", pixelParser.rgb5a3,   16, 4, 4, True,  0),
                             0x06: ("rgba32", textureParser.rgba32, 32, 4, 4, False, 0),
                             0x08: ("c4",     textureParser.c4,      4, 8, 8, False, 0x10),
                             0x09: ("c8",     textureParser.c8,      8, 8, 4, False, 0x100),
                             0x0A: ("c14x2",  textureParser.c14x2,  16, 4, 4, False, 0x400),
                             0x0E: ("cmpr",   textureParser.cmpr,    4, 8, 8, False, 0)
                             */
                            if (info[i].texFormat === 0x0E){
                                data = Texture.unswizzle(data, info[i].width, info[i].height, 8, 8);
                                data = Helper.dxt().decodeBC1(data, info[i].width, info[i].height, false, false);
                                data = Texture.flipBlocks(data);
                            }else if (info[i].texFormat === 0x03){
                                data = Texture.unswizzle(data, info[i].width, info[i].height);
                                data = Texture.decodeAlpha(data, info[i].width, info[i].height);

                                //TODO buggy / wrong :(
                            }else{
                                console.log("not implemented");
                                debugger;
                            }

                            textures.push({
                                width: info[i].width,
                                height: info[i].height,
                                texFormat: info[i].texFormat,
                                data: new Uint8Array(data),
                            });

                            console.log(info[i].texFormat);
                        }

                        return new NormalizeTexture({
                            mipmaps: [ { data: textures[0].data, width: textures[0].width, height: textures[0].height }],
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

    static decodeAlpha(data, width, height){
        let rgba = [];
        for(let i = 0; i < (width * height); i++){
            let val = data.getUint16(i);

            rgba.push(
                val & 0xFF,
                val & 0xFF,
                val & 0xFF,
                (val >> 8)
            );
        }

        return rgba;

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

    static unswizzle2(data, width, height){
        let bpp = 16;
        let bw = 4;
        let bh = 4;

        width  = (width  + bw - 1);// bw * bw
        height = (height + bh - 1); // bh * bh

        let stripSize = bpp * bw; // 8
        console.log(width, height, stripSize);

        let result = new ArrayBuffer(width * height * bpp);
        let view = new DataView(result);
        let ptr = 0;

        for (let y = 0; y < height; y = y + bh){
            for (let x = 0; x < width; x = x + bw){
                for (let y2 = 0; y2 < bh; y2++){
                    let idx = (((y + y2) * width) + x) * bpp; // 8

                    for(let i = 0; i < stripSize; i++){
                        view.setUint8(idx + i, data.getUint8(ptr + i));
                    }
                    // result[idx : idx+stripSize] = buffer[ptr : ptr+stripSize]
                    ptr += stripSize;
                }
            }
        }

        return view;

    }
    static unswizzle(data, width, height, blockWidth, blockHeight ){
        let result = new ArrayBuffer(data.byteLength);
        let view = new DataView(result);

        let BlocksPerW = width / blockWidth;
        let BlocksPerH = height / blockHeight;

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