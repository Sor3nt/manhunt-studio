
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


export class NormalizedTexture{

    static FORMAT_BC1_RGBA = 1;             //PC
    static FORMAT_BC1_RGBA_WII = 2;  //Wii Manhunt 2
    static FORMAT_BC1_RGB = 3;  //Wii Manhunt 2
    static FORMAT_BC2_RGBA = 4;             //PC
    static FORMAT_IA8 = 5;                  //Wii Manhunt 2
    static FORMAT_PLAYSTATION = 6;          //PSP and PS2
    static FORMAT_DDS = 7;          //generic DDS container

    source = {
        textureData: null,
        texturePaletteData: null,
        width: null,
        height: null,
        bbp: null,
        platform: null,
        format: null,
        swizzled: false
    };

    texture = {
        mipmaps: [ { data: new Uint8Array(), width: null, height: null }],
        width: null,
        height: null,
        format: null
    };

    constructor( textureData, texturePaletteData, width, height, bbp, platform, format, swizzled ){
        this.source.textureData = textureData;
        this.source.texturePaletteData = texturePaletteData;
        this.source.width = width;
        this.source.height = height;
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
        realTexture.needsUpdate = true;
        realTexture.minFilter = 1006;
console.log("source", this.source);
console.log("FINAL", realTexture);
        return realTexture;
    }

    #decode(){
        if (this.source.format === NormalizedTexture.FORMAT_DDS){
            this.texture = (new DDSLoader()).parse(this.source.textureData);
            this.texture.generateMipmaps = false;
            return;
        }

        this.texture.format = RGBAFormat;
        this.texture.width = this.source.width;
        this.texture.height = this.source.height;

        if (this.source.platform === "ps2" || this.source.platform === "psp")
            this.texture.mipmaps = this.#decodePlaystation();

        else if (this.source.platform === "wii")
            this.texture.mipmaps = this.#decodeWii();

        else if (this.source.platform === "pc")
            this.texture.mipmaps = this.#decodePc();

        else if (this.source.platform === "xbox"){
            this.texture.mipmaps = this.#decodeXbox();
            this.texture.format = this.source.format;

        }
    }



    #decodeXbox() {
        let data = this.source.textureData;

        return [{
            data: new Uint8Array(data.buffer),
            width: this.source.width,
            height: this.source.height,
        }];
    }


    #decodePc() {
        let data = this.source.textureData;

        switch (this.source.format) {
            case NormalizedTexture.FORMAT_BC1_RGBA:
                data = DXT.decodeBC1(this.source.textureData, this.source.width, this.source.height);
                break;
            case NormalizedTexture.FORMAT_BC1_RGB:
                data = DXT.decodeBC1(this.source.textureData, this.source.width, this.source.height, true);
                this.texture.format = RGBFormat;
                break;
            case NormalizedTexture.FORMAT_BC2_RGBA:
                data = DXT.decodeBC2(this.source.textureData, this.source.width, this.source.height, false);
                break;
            default:
                debugger;
        }

        return [{
            data: data,
            width: this.source.width,
            height: this.source.height,
        }];
    }

    #decodeWii() {
        let data;

        switch (this.source.format) {
            case NormalizedTexture.FORMAT_BC1_RGBA_WII:
                data = Wii.unswizzle(this.source.textureData, this.source.width, this.source.height, 8, 8);
                data = DXT.decodeBC1(data, this.source.width, this.source.height, false, false);
                data = Wii.flipBlocks(data);
                break;
            default:
                debugger;
        }

        return [{
            data: new Uint8Array(data) ,
            width: this.source.width,
            height: this.source.height,
        }];
    }

    #decodePlaystation() {

        let palette = false;
        if (this.source.texturePaletteData){
            palette = Playstation.decode32ColorsToRGBA( this.source.texturePaletteData);
        }

        let rgbaArray;

        switch (this.source.bbp) {
            case 4:
                rgbaArray = Playstation.convertIndexed4ToRGBA(
                    this.source.textureData,
                    this.source.width * this.source.height,
                    palette
                );

                break;
            case 8:
                if (this.source.platform === "ps2")
                    palette = Playstation.paletteUnswizzle(palette);

                rgbaArray = Playstation.convertIndexed8ToRGBA(
                    this.source.textureData,
                    palette
                );

                break;
            case 32:
                rgbaArray = Playstation.decode32ColorsToRGBA( new NBinary(this.source.textureData));
                break;

            default:
                debugger;
                break;

        }


        if (this.source.platform === "ps2" && this.source.swizzled) {
            rgbaArray = Playstation.unswizzlePlaystation2(rgbaArray, this.source.width, this.source.height);
        }else if (this.source.platform === "psp"){
            rgbaArray = Playstation.unswizzlePlaystationPortable(rgbaArray, this.source.width, this.source.height, this.source.bbp === 4);
        }

        //flat the rgba array
        let rgbaFlat = [];
        rgbaArray.forEach(function (block) {
            rgbaFlat.push(block[0],block[1],block[2],block[3]);
        });


        return [{
            data: new Uint8Array(rgbaFlat),
            width: this.source.width,
            height: this.source.height,
        }];

    }
}