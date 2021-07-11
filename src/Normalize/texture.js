
import Renderware from "./../Plugin/Loader/Renderware/Renderware.js";
import {LinearFilter, RGBFormat, MeshLambertMaterial, DataTexture, CompressedTexture, RepeatWrapping, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGBAFormat} from "./../Vendor/three.module.js";
import Helper from "../Helper.js";


export default class NormalizeTexture{

    /**
     * @type { { mipmap: {data: ArrayBuffer, width: int, height: int}[], width: int, height: int, format: int } }
     */
    texture;

    constructor( info ){

        this.info = info;
        this.texture = {};
        this.#normalize(info);
    }

    createThreeTexture(){
        let realTexture = new DataTexture(
            this.texture.mipmap[0].data,
            this.texture.width,
            this.texture.height,
            this.texture.format
        );

        realTexture.name = this.info.name;
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
    #normalize( info ){
        this.texture = {
            mipmap: [
                { data: info.mipmap[0], width: info.width[0], height: info.height[0], }
            ],
            width: info.width[0],
            height: info.height[0],
            format: info.format
        };
    }
}