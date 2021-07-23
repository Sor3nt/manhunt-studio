export default class Nintendo {

    //todo: move to "Nintendo.js"
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

    //todo: move to "Nintendo.js"
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