
import { RGB_S3TC_DXT1_Format,
    RGBA_S3TC_DXT1_Format,
    RGBA_S3TC_DXT3_Format,
    RGBA_S3TC_DXT5_Format,
    CompressedTexture, DataTexture, RepeatWrapping} from "./../Vendor/three.module.js";


export default class NormalizeTexture{

    /**
     * @type { { mipmaps: {data: ArrayBuffer, width: int, height: int}[], width: int, height: int, format: int, alphaMap: {data: ArrayBuffer, width: int, height: int} } }
     */
    texture;

    constructor( texture ){
        // this.info = info;
        this.texture = texture;
        // this.#normalize(info);
    }

    hasAlphaMap(){
        return this.texture.alphaMap !== null;
    }

    createThreeTextureAlphaMap(){
// console.log(this.texture.texFormat, this.texture.alphaMap.texFormat);
        let realTexture = new DataTexture(
            this.texture.alphaMap.data,
            this.texture.alphaMap.width,
            this.texture.alphaMap.height,
            1023
        );


        realTexture.name = this.texture.name;
        realTexture.wrapS = RepeatWrapping;
        realTexture.wrapT = RepeatWrapping;
        // realTexture.magFilter = LinearFilter;
        // realTexture.minFilter = LinearFilter;
        // realTexture.format = this.texture.format;
        realTexture.needsUpdate = true;

        return realTexture;
    }

    createThreeTexture(){

        let realTexture;
        if (
            this.texture.format === RGB_S3TC_DXT1_Format ||
            this.texture.format === RGBA_S3TC_DXT1_Format ||
            this.texture.format === RGBA_S3TC_DXT3_Format ||
            this.texture.format === RGBA_S3TC_DXT5_Format
        ){
            console.log(this.texture);
            realTexture = new CompressedTexture(
                this.texture.mipmaps,
                this.texture.width,
                this.texture.height,
                this.texture.format
            );

        }else{
            realTexture = new DataTexture(
                this.texture.mipmaps[0].data,
                this.texture.width,
                this.texture.height,
                this.texture.format
            );

        }

        realTexture.name = this.texture.name;
        realTexture.wrapS = RepeatWrapping;
        realTexture.wrapT = RepeatWrapping;
        // realTexture.magFilter = LinearFilter;
        // realTexture.minFilter = LinearFilter;
        realTexture.format = this.texture.format;
        realTexture.needsUpdate = true;

        return realTexture;
    }

    getTexture(){
        return this.texture;
    }

    /**
     *
     * @param info { {mipmap: ArrayBuffer[], width: int[], height: int[], format: int} }
     */
    // #normalize( info ){
    //     this.texture = {
    //         mipmap: [
    //             { data: info.mipmap[0], width: info.width[0], height: info.height[0], }
    //         ],
    //         width: info.width[0],
    //         height: info.height[0],
    //         format: info.format
    //     };
    // }
}