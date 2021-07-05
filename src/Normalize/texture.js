
import Renderware from "./../Plugin/Loader/Renderware/Renderware.js";
import {LinearFilter, RGBFormat, MeshLambertMaterial, DataTexture, CompressedTexture, RepeatWrapping, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGBAFormat} from "./../Vendor/three.module.js";
import Helper from "../Helper.js";


export default class NormalizeTexture{

    constructor( info ){

        this.info = info;
        this.texture = {};
        this.#normalize(info);
    }

    createThreeTexture(){
        let realTexture = new DataTexture(this.texture.data, this.texture.width, this.texture.height, this.texture.format);
        // let realTexture = new CompressedTexture([{data: this.texture.data, width: this.texture.width, height: this.texture.height }], this.texture.width, this.texture.height);
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

    #normalize( info ){
        let texture = {
            width: info.width[0],
            height: info.height[0],
            format: info.format || null,
        };

        let rgba;
        // rgba = info.mipmap[0];
        switch ( info.rasterFormat & 0xf00 ) {

            case Renderware.RASTER_565:
                rgba = info.mipmap[0];
                rgba = Helper.dxt().decodeBC1(info.mipmap[0], info.width[0], info.height[0]);
                texture.format = RGBAFormat;
                break;

            case Renderware.RASTER_1555:
                rgba = Helper.dxt().decodeBC1(info.mipmap[0], info.width[0], info.height[0]);
                texture.format = RGBFormat;
                break;

            case Renderware.RASTER_4444:
                rgba = Helper.dxt().decodeBC2(info.mipmap[0], info.width[0], info.height[0], true);
                texture.format = RGBAFormat;
                break;

            case Renderware.RASTER_8888:
                rgba = info.mipmap[0].buffer;
                texture.format = RGBAFormat;
                break;
            default:
                console.error("decode not dxt", texture.rasterFormat & 0xf00);
                debugger;
        }

        texture.data = new Uint8Array( rgba );
        this.texture = texture;
            //
            // let rgba, format;
            //
            // let texture = this.texture;
            //
            // switch (texture.platform) {
            //     case Renderware.PLATFORM_PS2:
            //     case Renderware.PLATFORM_PS2FOURCC:
            //         //
            //         // threeTextures.push({
            //         //     format: THREE.RGBAFormat,
            //         //     name: texture.name,
            //         //     width: texture.width[0],
            //         //     height: texture.height[0],
            //         //     data: new Uint8Array( psImage.convertToRgba(result, 'ps2') )
            //         // } );
            //
            //         break;
            //     // case Renderware.PLATFORM_XBOX:
            //     //     this.parseXbox(struct);
            //     //     break;
            //
            //     case Renderware.PLATFORM_D3D8:
            //     case Renderware.PLATFORM_D3D9:
            //
            //         switch ( texture.rasterFormat & 0xf00 ) {
            //             case Renderware.RASTER_1555:
            //                 rgba = MANHUNT.converter.dxt.decodeBC1(texture.mipmap[0], texture.width[0], texture.height[0]);
            //                 format = RGBFormat;
            //                 break;
            //             case Renderware.RASTER_565:
            //                 format = RGB_S3TC_DXT1_Format;
            //
            //                 //TODO: i am not sure why i am not be able to apply the data as THREE DXT Format
            //                 rgba = MANHUNT.converter.dxt.decodeBC1(texture.mipmap[0], texture.width[0], texture.height[0]);
            //                 format = RGBAFormat;
            //                 break;
            //
            //             case Renderware.RASTER_4444:
            //                 //TODO: i am not sure why i am not be able to apply the data as THREE DXT Format
            //                 rgba = MANHUNT.converter.dxt.decodeBC2(texture.mipmap[0], texture.width[0], texture.height[0], true);
            //                 format = RGBAFormat;
            //
            //                 break;
            //             case Renderware.RASTER_8888:
            //                 rgba = texture.mipmap[0].buffer;
            //                 format = RGBAFormat;
            //
            //                 break;
            //
            //             default:
            //                 console.error("decode not dxt", texture.rasterFormat & 0xf00);
            //                 debugger;
            //                 break;
            //         }
            //
            //
            //         return {
            //             format: format,
            //             name: texture.name,
            //             width: texture.width[0],
            //             height: texture.height[0],
            //             data: new Uint8Array( rgba )
            //         };
            //
            //     default:
            //         console.error("Platform not supported ", texture.platform);
            //         debugger;
            //         break;
            // }

    }
}