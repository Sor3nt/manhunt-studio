import NBinary from "./../../NBinary.js";

export default class Playstation{
    static alphaDecodingTable = [

        0,   2,   4,   6,   8,   10,  12,  14,  16,  18,  20,  22,  24,  26,  28,  30,
        32,  34,  36,  38,  40,  42,  44,  46,  48,  50,  52,  54,  56,  58,  60,  62,
        64,  66,  68,  70,  72,  74,  76,  78,  80,  82,  84,  86,  88,  90,  92,  94,
        96,  98,  100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126,
        128, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155, 157,
        159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179, 181, 183, 185, 187, 189,
        191, 193, 195, 197, 199, 201, 203, 205, 207, 209, 211, 213, 215, 217, 219, 221,
        223, 225, 227, 229, 231, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253,
        255

    ];

    static getRasterSize( format, width, height, bpp ){

        if (format === 512 && bpp === 8) return width * height;

        if (format === 256 && bpp === 32) return width * height;
        if (format === 256 && bpp === 8) return width * height;
        if (format === 256 && bpp === 4) return width * height;

        if (format === 128 && bpp === 32) return width * height;
        if (format === 128 && bpp === 8) return width * height;
        if (format === 128 && bpp === 4) return (width * height) / 2;

        if (format === 64 && bpp === 8) return width * height;
        if (format === 64 && bpp === 4) return (width * height) / 2;

        if (format === 32 && bpp === 8) return width * height;
        if (format === 32 && bpp === 4) return (width * height) / 2;

        if (format === 16 && bpp === 8) return width * height;
        if (format === 16 && bpp === 4) return (width * height) / 2;

        if (format === 8 && bpp === 4) return (width * height) / 2;

        console.error("Unknown raster format " + format + " bpp:" + bpp);
        debugger;
    }

    static getPaletteSize( format, bpp ){
        if (format === 512 && bpp === 8) return 1024;

        if (format === 256 && bpp === 32) return 1024;
        if (format === 256 && bpp === 8) return 1024;
        if (format === 256 && bpp === 4) return 64;

        if (format === 128 && bpp === 32) return 1024;
        if (format === 128 && bpp === 8) return 1024;
        if (format === 128 && bpp === 4) return 64;

        if (format === 64 && bpp === 8) return 1024;
        if (format === 64 && bpp === 4) return 64;

        if (format === 32 && bpp === 8) return 1024;
        if (format === 32 && bpp === 4) return 64;

        if (format === 16 && bpp === 8) return 1024;
        if (format === 16 && bpp === 4) return 64;

        console.error("Unknown palette format " + format + " bpp:" + bpp);
        debugger;
    }

    static decode32ColorsToRGBA(colors) {

        let result = [];

        while (colors.remain()) {
            let dst = [];

            dst.push(colors.consume(1, 'uint8')); //r

            dst.push(colors.consume(1, 'uint8')); //g

            dst.push(colors.consume(1, 'uint8')); //b

            let alpha = colors.consume(1, 'uint8'); //a

            //

            dst.push(alpha > 0x80 ? 255 : Playstation.alphaDecodingTable[alpha]);

            result.push(dst);
        }

        return result;
    }

    static convertIndexed4ToRGBA(binary, count, palette) {
        let result = [];

        for (let i = 0; i < count; i = i + 2) {
            let val = binary.consume(1, 'uint8');

            result.push(palette[val & 0x0F]);
            result.push(palette[val >> 4]);
        }

        return result;
    }

    static paletteUnswizzle(palette) {


        //Ruleset:

        /*
             * 1. first 8 colors stay
             *
             * 2. next 8 colors are twisted with the followed 8 colors
             * 3. 16 colors stay
             *
             * 4. goto step 2
             */

        let newPalette = [];

        let i,j,chunk = 8;
        let palChunks = [];
        for (i=0,j=palette.length; i<j; i+=chunk) {
            palChunks.push(palette.slice(i,i+chunk));
        }

        // let palChunks = array_chunk(palette, 8);

        let current = 0;
        let swapCount = 2;

        while(current < palChunks.length){

            let chunk = palChunks[current];

            if (current === 0){
                newPalette.push(chunk);
                current++;
                swapCount = 2;
                continue;
            }


            if (swapCount === 2){
                newPalette.push(palChunks[current + 1]);
                newPalette.push(palChunks[current]);
                current++;
                swapCount = 0;
            }else{
                newPalette.push(chunk);
                swapCount++;
            }

            current++;
        }

        let finalPalette = [];
        newPalette.forEach(function (chunk) {
            chunk.forEach(function (rgba) {
                finalPalette.push(rgba);
            });
        });

        return finalPalette;
    }

    static convertIndexed8ToRGBA(binary, palette) {

        let result = [];

        for (let i = 0; i < binary.length(); i++) {
            let src = binary.consume(1, 'uint8');
            result.push(palette[src]);
        }

        return result;

    }

    static unswizzlePs2(texture, bmpRgba) {

        let result = [];

        for (let y = 0; y < texture.height; y++){

            for (let x = 0; x < texture.width; x++) {
                let block_loc = (y&(~0x0F))*texture.width + (x&(~0x0F))*2;
                let swap_sel = (((y+2)>>2)&0x01)*4;
                let ypos = (((y&(~3))>>1) + (y&1))&0x07;
                let column_loc = ypos*texture.width*2 + ((x+swap_sel)&0x07)*4;
                let byte_sum = ((y>>1)&1) + ((x>>2)&2);
                let swizzled = block_loc + column_loc + byte_sum;

                result[y*texture.width+x] = bmpRgba[swizzled];
            }

        }

        return result;
    }

    static unswizzlePsp(texture, bmpRgba, as4Bit) {
        if (texture.width <= 16) return bmpRgba;

        let blockWidth = as4Bit ? 32 : 16;
        let blockHeight = 8;

        if (texture.width === 16)
            blockWidth = 16;

        let blockSize = blockHeight * blockWidth;

        let start = 0;

        let unswizzled = [];
        bmpRgba.forEach(function () {
            unswizzled.push([0,0,0,0]);
        });
        let swizzled = bmpRgba;

        let size = bmpRgba.length - start;
        let blockCount = size / blockSize;
        let blocksPerRow = texture.width / blockWidth;

        for (let  block = 0; block < blockCount; ++block)
        {
            let by = parseInt((block / blocksPerRow)) * blockHeight;
            let bx = parseInt((block % blocksPerRow)) * blockWidth;

            for (let y = 0; y < blockHeight; y++) {
                for (let x = 0; x < blockWidth; x++) {
                    unswizzled[start + (by + y) * texture.width + bx + x] =
                        swizzled[start + block * blockSize + y * blockWidth + x];
                }
            }
        }

        return unswizzled;
    }


    static convertToRgba(texture, platform) {

        let palette = false;
        if (texture.palette){
            palette = Playstation.decode32ColorsToRGBA( texture.palette);
        }

        let is4Bit = texture.bitPerPixel === 4;

        let bmpRgba;
        if (texture.bitPerPixel === 4) {

            if (palette){
                bmpRgba = Playstation.convertIndexed4ToRGBA(
                    texture.data,
                    (texture.width * texture.height),
                    palette
                );

            }else{
                console.error("todo 4bit no palette ?!");
                debugger;
            }

        }else if (texture.bitPerPixel === 8){

            if (palette) {
                if (platform === "ps2") {
                    palette = Playstation.paletteUnswizzle(palette);
                }

                bmpRgba = Playstation.convertIndexed8ToRGBA(
                    texture.data,
                    palette
                );
            }else{
                console.error("todo 8bit no palette");
                debugger;
            }

        }else if (texture.bitPerPixel === 32){

            bmpRgba = Playstation.decode32ColorsToRGBA( new NBinary(texture.data));

        }else{
            console.error("Unknown bitPerPixel format " + texture.bitPerPixel);
            debugger;
        }

        if (platform === "ps2" && texture.swizzleMask & 0x1 !== 0) {
            bmpRgba = Playstation.unswizzlePs2(texture, bmpRgba);
        }else if (platform === "psp"){
            bmpRgba = Playstation.unswizzlePsp(texture, bmpRgba, is4Bit);
        }

        //flat the rgba array
        let rgbaFlat = [];
        bmpRgba.forEach(function (block) {
            rgbaFlat.push(block[0],block[1],block[2],block[3]);
        });

        return rgbaFlat;
    }

}