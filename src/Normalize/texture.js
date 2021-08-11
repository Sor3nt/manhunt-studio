
import { RGBFormat, RGBAFormat,  RGB_S3TC_DXT1_Format,
    RGBA_S3TC_DXT1_Format,
    RGBA_S3TC_DXT3_Format,
    RGBA_S3TC_DXT5_Format,
    CompressedTexture, DataTexture, RepeatWrapping} from "./../Vendor/three.module.js";
import DXT from "../Helper/Texture/DXT.js";
import NBinary from "../NBinary.js";
import Playstation from "../Helper/Texture/Playstation.js";
import {default as Wii} from "../Plugin/Loader/Game/Manhunt2/Wii/Texture.js";
import {DDSLoader} from "../Vendor/three.dds.loader.js";
import Nintendo from "../Helper/Texture/Nintendo.js";


export class NormalizedTexture{

    static FORMAT_BC1_RGBA = 1;             //PC
    static FORMAT_BC1_RGBA_WII = 2;  //Wii Manhunt 2
    static FORMAT_BC1_RGB = 3;  //Wii Manhunt 2
    static FORMAT_BC2_RGBA = 4;             //PC
    static FORMAT_IA8 = 5;                  //Wii Manhunt 2
    static FORMAT_PLAYSTATION = 6;          //PSP and PS2
    static FORMAT_DDS = 7;          //generic DDS container

    source = {
        data: null,
        mipmaps: [],
        palette: null,

        bbp: null,

        platform: null,
        format: null,

        swizzled: false
    };

    texture = {
        mipmaps: [ /*{ data: new Uint8Array(), width: null, height: null } */ ],
        width: null,
        height: null,
        format: null
    };

    constructor( mipmaps, palette, bbp, platform, format, swizzled, data ){
        this.source.data = data; //raw data in case of DDS as example

        this.source.mipmaps = mipmaps;
        this.source.palette = palette;

        this.source.bbp = bbp;

        this.source.platform = platform;
        this.source.format = format;
        this.source.swizzled = swizzled || false;
    }

    createThreeTexture(){

        if (this.texture.format === null)
            this.#decode();


        let realTexture;
        if (
            this.texture.format === RGB_S3TC_DXT1_Format ||
            this.texture.format === RGBA_S3TC_DXT1_Format ||
            this.texture.format === RGBA_S3TC_DXT3_Format ||
            this.texture.format === RGBA_S3TC_DXT5_Format
        ){
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

        realTexture.wrapS = RepeatWrapping;
        realTexture.wrapT = RepeatWrapping;

        if (this.texture.mipmaps.length === 1)
            realTexture.minFilter = 1006;

        realTexture.needsUpdate = true;

        return realTexture;
    }

    #decode(){
        if (this.source.format === NormalizedTexture.FORMAT_DDS){
            this.texture = (new DDSLoader()).parse(this.source.data);
            this.texture.generateMipmaps = false;
            return;
        }

        this.texture.width = this.source.mipmaps[0].width;
        this.texture.height = this.source.mipmaps[0].height;

        if (
            this.source.format === RGB_S3TC_DXT1_Format ||
            this.source.format === RGBA_S3TC_DXT1_Format ||
            this.source.format === RGBA_S3TC_DXT3_Format ||
            this.source.format === RGBA_S3TC_DXT5_Format
        ){
            this.texture.format = this.source.format;
            this.texture.mipmaps = this.source.mipmaps;

            return;
        }


        if (this.source.platform === "ps2" || this.source.platform === "psp"){
            this.#decodePlaystation();
            this.texture.format = RGBAFormat;
            return;
        }

        let _this = this;
        this.source.mipmaps.forEach(function (mipmap) {

            let data;
            switch (_this.source.format) {
                case NormalizedTexture.FORMAT_BC1_RGBA:
                    data = DXT.decodeBC1(mipmap.data, mipmap.width, mipmap.height);
                    _this.texture.format = RGBAFormat;
                    break;
                case NormalizedTexture.FORMAT_BC1_RGB:
                    data = DXT.decodeBC1(mipmap.data, mipmap.width, mipmap.height, false);
                    _this.texture.format = RGBAFormat;
                    break;
                case NormalizedTexture.FORMAT_BC2_RGBA:
                    data = DXT.decodeBC2(mipmap.data, mipmap.width, mipmap.height, false);
                    _this.texture.format = RGBAFormat;
                    break;
                case NormalizedTexture.FORMAT_BC1_RGBA_WII:
                    let _data = Nintendo.unswizzle(mipmap.data, mipmap.width, mipmap.height, 8, 8);
                    _data = DXT.decodeBC1(_data, mipmap.width, mipmap.height, false, false);
                    data = new Uint8Array(Nintendo.flipBlocks(_data));
                    _this.texture.format = RGBAFormat;
                    break;

                default:
                    debugger;
            }

            _this.texture.mipmaps.push({
                data: data,
                width: mipmap.width,
                height: mipmap.height,
            });
        });


        //
        // else if (this.source.platform === "wii")
        //     this.texture.mipmaps = this.#decodeWii();
        //
        // else if (this.source.platform === "pc")
        //     this.texture.mipmaps = this.#decodePc();


    }
    //
    // #decodePc(){
    //     let data = this.source.textureData;
    //
    //     switch (this.source.format) {
    //         case NormalizedTexture.FORMAT_BC1_RGBA:
    //             data = DXT.decodeBC1(this.source.textureData, this.source.width, this.source.height);
    //             break;
    //         case NormalizedTexture.FORMAT_BC1_RGB:
    //             data = DXT.decodeBC1(this.source.textureData, this.source.width, this.source.height, true);
    //             this.texture.format = RGBFormat;
    //             break;
    //         case NormalizedTexture.FORMAT_BC2_RGBA:
    //             data = DXT.decodeBC2(this.source.textureData, this.source.width, this.source.height, false);
    //             break;
    //         default:
    //             debugger;
    //     }
    //
    //     return [{
    //         data: data,
    //         width: this.source.width,
    //         height: this.source.height,
    //     }];
    // }
    //
    // #decodeWii() {
    //     let data;
    //
    //     switch (this.source.format) {
    //         case NormalizedTexture.FORMAT_BC1_RGBA_WII:
    //             data = Wii.unswizzle(this.source.textureData, this.source.width, this.source.height, 8, 8);
    //             data = DXT.decodeBC1(data, this.source.width, this.source.height, false, false);
    //             data = Wii.flipBlocks(data);
    //             break;
    //         default:
    //             debugger;
    //     }
    //
    //     return [{
    //         data: new Uint8Array(data) ,
    //         width: this.source.width,
    //         height: this.source.height,
    //     }];
    // }

    #decodePlaystation() {

        let palette = false;
        if (this.source.palette){
            palette = Playstation.decode32ColorsToRGBA( this.source.palette );
        }

        let _this = this;
        this.source.mipmaps.forEach(function (mipmap) {

            let rgbaArray;
            switch (_this.source.bbp) {
                case 4:
                    rgbaArray = Playstation.convertIndexed4ToRGBA(
                        mipmap.data,
                        mipmap.width * mipmap.height,
                        palette
                    );

                    break;
                case 8:
                    if (_this.source.platform === "ps2")
                        palette = Playstation.paletteUnswizzle(palette);

                    rgbaArray = Playstation.convertIndexed8ToRGBA(
                        mipmap.data,
                        palette
                    );

                    break;
                case 32:
                    rgbaArray = Playstation.decode32ColorsToRGBA( new NBinary(mipmap.data));
                    break;

                default:
                    debugger;
                    break;

            }


            if (_this.source.platform === "ps2" && _this.source.swizzled) {
                rgbaArray = Playstation.unswizzlePlaystation2(rgbaArray, mipmap.width, mipmap.height);
            }else if (_this.source.platform === "psp"){
                rgbaArray = Playstation.unswizzlePlaystationPortable(rgbaArray, mipmap.width, mipmap.height, _this.source.bbp === 4);
            }

            //flat the rgba array
            let rgbaFlat = [];
            rgbaArray.forEach(function (block) {
                rgbaFlat.push(block[0],block[1],block[2],block[3]);
            });
            _this.texture.mipmaps.push({
                data: new Uint8Array(rgbaFlat),
                width: mipmap.width,
                height: mipmap.height,
            });
        });

        //
        // return [{
        //     data: new Uint8Array(rgbaFlat),
        //     width: this.source.width,
        //     height: this.source.height,
        // }];

    }
}