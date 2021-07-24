export default class Nintendo {

    /**
     * @param data {ArrayBuffer}
     * @returns {int[]}
     */
    static flipBlocks(data){

        /**
         * Flip 4x4 blocks
         */
        let pixels = [] ;
        for (let i = 0,j = data.byteLength; i < j; i += 4) {
            pixels.push(data.slice(i, i + 4))
        }

        let current = 0;
        let rgbaBlocks = [];
        while (current < pixels.length){
            rgbaBlocks.push(
                pixels[current + 3],
                pixels[current + 2],
                pixels[current + 1],
                pixels[current]
            );

            current += 4;
        }

        //flat result
        let rgbaNew = [];
        rgbaBlocks.forEach(function (rgbaBlock) {
            rgbaBlock.forEach(function (color) {
                rgbaNew.push(color);
            })
        });

        return rgbaNew;
    }

    /**
     *
     * @param data {DataView}
     * @param width {int}
     * @param height {int}
     * @param blockWidth {int}
     * @param blockHeight {int}
     * @returns {DataView}
     */
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