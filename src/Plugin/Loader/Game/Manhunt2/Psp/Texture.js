import AbstractLoader from "./../../../Abstract.js";
import Result from "../../../Result.js";
import NBinary from "../../../../../NBinary.js";

export default class Texture extends AbstractLoader{
    static name = "Texture (Manhunt 2 PSP)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //TCDT
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
            let name = binary.consume(64, 'nbinary').getString(0, false);


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


    /**
     * Todo: refactor, this is bulllshit...
     *
     * @param format
     * @param width
     * @param height
     * @param bpp
     * @returns {number}
     */
    static getRasterSize( format, width, height, bpp ){

        if (format === 128 && bpp === 32) return width * height;
        if (format === 128 && bpp === 8) return width * height;
        if (format === "08000000" && bpp === 4) return (width * height) / 2;
        if (format === 16 && bpp === 4) return (width * height) / 2;
        if (format === 128 && bpp === 4) return (width * height) / 2;
        if (format === "00010000" && bpp === 8) return width * height;
        if (format === 32 && bpp === 4) return (width * height) / 2;
        if (format === "00010000" && bpp === 4) return width * height;
        if (format === 64 && bpp === 4) return (width * height) / 2;
        if (format === 64 && bpp === 8) return width * height;
        if (format === 32 && bpp === 8) return width * height;
        if (format === 16 && bpp === 8) return width * height;
        if (format === "00010000" && bpp === 32) return width * height;
        if (format === "00020000" && bpp === 8) return width * height;

        console.error("Unknown raster format " + format + " bpp:" + bpp);
        debugger;

    }

    /**
     * Todo: refactor, this is bulllshit...
     *
     * @param format
     * @param bpp
     * @returns {number}
     */
    static getPaletteSize( format, bpp ){
        // if (format === "00010000" && bpp === 8) return 1024;
        if (format === 16 && bpp === 8) return 1024;
        if (format === 32 && bpp === 8) return 1024;
        if (format === 64 && bpp === 8) return 1024;
        if (format === 128 && bpp === 32) return 1024;
        if (format === 128 && bpp === 8) return 1024;
        // if (format === "80000000" && bpp === 4) return 1024;
        // if (format === "00010000" && bpp === 32) return 1024;
        //
        //
        if (format === 128 && bpp === 4) return 64;
        if (format === 16 && bpp === 4) return 64;
        if (format === 32 && bpp === 4) return 64;
        if (format === 64 && bpp === 4) return 64;
        // if (format === "00010000" && bpp === 4) return 64;
        // if (format === "00020000" && bpp === 8) return 1024;

        console.error("Unknown palette format " + format + " bpp:" + bpp);
        die;
    }

    static parseTexture( binary ){

        let texture = {
            'prevOffset'        : binary.consume(4, 'int32'),
            'nextOffset'        : binary.consume(4, 'int32'),
            'name'              : binary.consume(64, 'nbinary').getString(0, false),

            'width'             : binary.consume(4, 'int32'),
            'height'            : binary.consume(4, 'int32'),
            'bitPerPixel'       : binary.consume(4, 'int32'),
            'rasterFormat'      : binary.consume(4, 'int32'),

            'pixelFormat'       : binary.consume(4,  'int32'),
            'mipMapCount'       : binary.consume(1,  'int8'),
            'swizzleMask'       : binary.consume(1,  'int8'),
            'padding'           : binary.consume(2, 'uint16'),

            'dataOffset'        : binary.consume(4, 'int32'),
            'paletteOffset'     : binary.consume(4, 'int32'),

            'palette'           : false
        };

        if (texture.paletteOffset > 0){
            binary.setCurrent(texture.paletteOffset);

            texture.palette = binary.consume(
                Texture.getPaletteSize(texture.rasterFormat, texture.bitPerPixel),
                'nbinary'
            );
        }

        binary.setCurrent(texture.dataOffset);

        texture.data = binary.consume(
            Texture.getRasterSize(texture.rasterFormat, texture.width, texture.height, texture.bitPerPixel),
            'nbinary'
        );

        return texture;
    }

    //
    // static parse(binary){
    //
    //
    //     let header = {
    //         'magic'             : binary.consume(4,  'string'),
    //         'constNumber'       : binary.consume(4, 'int32'),
    //         'fileSize'          : binary.consume(4, 'int32'),
    //         'indexTableOffset'  : binary.consume(4, 'int32'),
    //         'indexTableOffset2' : binary.consume(4, 'int32'),
    //         'numIndex'          : binary.consume(4, 'int32'),
    //         'unknown'           : binary.consume(8,  'dataview'),
    //         'numTextures'       : binary.consume(4, 'int32'),
    //         'firstOffset'       : binary.consume(4, 'int32'),
    //         'lastOffset'       : binary.consume(4, 'int32')
    //     };
    //
    //     let currentOffset = header.firstOffset;
    //
    //     let textures = [];
    //     while(header.numTextures > 0) {
    //         let texture = Texture.parseTexture(currentOffset, binary);
    //
    //         if (texture.width <= 2 && texture.height <= 2){
    //             currentOffset = texture.nextOffset;
    //
    //             header.numTextures--;
    //             continue;
    //         }
    //
    //         textures.push(
    //             {
    //                 name: texture.name,
    //                 data: texture.data,
    //             }
    //         );
    //
    //         currentOffset = texture.nextOffset;
    //         if (currentOffset === 36) return textures;
    //
    //         header.numTextures--;
    //     }
    //     return textures;
    // }
}