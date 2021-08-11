import Renderware from "./../Renderware.js";
import Helper from './../../../../Helper.js'
import Chunk from "./Chunk.js";
import {RGBA_S3TC_DXT3_Format,RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT5_Format} from "../../../../Vendor/three.module.js";
import {NormalizedTexture} from "../../../../Normalize/texture.js";
const assert = Helper.assert;

export default class TextureNative extends Chunk{

    platform = "";

    texture = {
        mipmapCount: 1,
        mipmaps: [],
        width: 0,
        height: 0,
        format: 0,
        bitPerPixel: 0,
    };

    result = {
        platform: null,
        filterFlags: null,
        name: null,
        alphaName: null,
        rasterFormat: null,
        width: [],
        height: [],
        rasterType: null,
        dxtCompression: null,
        hasAlpha: null,
        mipmap: [],
        palette: null,
        swizzleMask: null,

        //PC only
        d3dTextureFormat: null,

        //PS2 only
        swizzleWidth: [],
        swizzleHeight: [],

        //Versionn 784
        addrModeU: null,
        addrModeV: null,

        chunks: []
    };

    list(){
        let struct = Renderware.parseHeader(this.binary);
        assert(struct.id, Renderware.CHUNK_STRUCT);

        let platform = Renderware.PLATFORM_D3D9;

        switch (struct.version) {
            case 784:
                this.binary.seek(4); //filter flag, addrModeU, addrModeV, pad
                break;

            case 268828671:
                platform = this.binary.uInt32();
                break;

            default:
                platform = this.binary.uInt32();
                break;


        }

        let name = "unknown";
        switch (platform) {
            case Renderware.PLATFORM_PS2:
            case Renderware.PLATFORM_PS2FOURCC:
                this.platform = "ps2";
                this.binary.seek(12); //string header
                name = this.binary.getString(0);
                break;

            case Renderware.PLATFORM_XBOX:
                this.platform = "xbox";

                this.binary.seek(4); //filterFlag
                name = this.binary.consume(32, 'nbinary').getString(0);

                break;

            case Renderware.PLATFORM_D3D8:
            case Renderware.PLATFORM_D3D9:
                this.platform = "pc";

                let nameLen = 32;
                if (struct.version === 784){
                    nameLen = 128;
                }

                this.binary.seek(4); //filterFlag
                name = this.binary.consume(nameLen, 'nbinary').getString(0);

                break;

            default:
                console.error("Platform not supported ", platform);
                debugger;
                break;
        }


        return name;
    }

    parse(){
        let struct = this.processChunk(this.binary);
        assert(struct.type, Renderware.CHUNK_STRUCT);

        if (struct.header.version === 268828671){

            this.result.platform = struct.binary.uInt32();
            this.result.filterFlags = struct.binary.uInt32();

            if (this.result.platform === Renderware.PLATFORM_PS2){
                this.validateParsing(struct);
            }else{
                struct.binary.seek(-4);
            }
        }

        else if (struct.header.version === 784){
            this.result.platform = Renderware.PLATFORM_D3D9;
            struct.binary.seek(4); //filter flag, addrModeU, addrModeV, pad
        }else{
            this.result.platform = struct.binary.uInt32();
        }


        switch (this.result.platform) {
            case Renderware.PLATFORM_PS2:
            case Renderware.PLATFORM_PS2FOURCC:
                this.parsePs2();
                break;

            case Renderware.PLATFORM_XBOX:
                this.parseXbox(struct);
                break;

            case Renderware.PLATFORM_D3D8:
            case Renderware.PLATFORM_D3D9:
                this.parsePc(struct);
                break;

            default:
                console.error("Platform not supported ", this.result.platform);
                debugger;
                break;
        }

        while(this.binary.remain() > 0){
            this.result.chunks.push(this.processChunk(this.binary));
        }

        this.validateParsing(this);
    }

    parsePc(struct){

        let nameLen = 32;
        if (struct.header.version === 784)
            nameLen = 128;

        let header = struct.binary.parseStruct({
            filterFlags:        'uInt32',
            name:               ['string0', nameLen],
            alphaName:          ['string0', nameLen],
            rasterFormat:       'uInt32',
            d3dTextureFormat:   'uInt32',

            width:              'uInt16',
            height:             'uInt16',
            bitPerPixel:        'uInt8',

            mipmapCount:        'uInt8',
            rasterType:         'uInt8',
            dxtCompression:     'uInt8'
        });

        let bufferSize = struct.binary.uInt32();
        assert(bufferSize, struct.binary.remain(), "remained data does not match!");

        this.texture.mipmaps.push({
            data: struct.binary.consume(bufferSize, 'dataview'),
            width: header.width,
            height: header.height
        });

        this.texture.width = header.width;
        this.texture.height = header.height;
        this.texture.name = header.name;


        switch ( header.rasterFormat & Renderware.RASTER_MASK ) {

            case Renderware.RASTER_565:
                this.texture.format = NormalizedTexture.FORMAT_BC1_RGBA;
                break;

            case Renderware.RASTER_1555:
                this.texture.format = NormalizedTexture.FORMAT_BC1_RGB;
                break;

            case Renderware.RASTER_4444:
                this.texture.format = NormalizedTexture.FORMAT_BC2_RGBA;
                break;

            default:
                debugger;
        }

        this.validateParsing(struct);

        while(this.binary.remain() > 0){
            this.result.chunks.push(this.processChunk(this.binary));
        }

        this.validateParsing(this);
    }

    parseXbox(struct){

        let header = struct.binary.parseStruct({
            filterFlags:        'uInt32',
            name:               ['string0', 32],
            alphaName:          ['string0', 32],
            rasterFormat:       'uInt32',
            hasAlpha:           'uInt32',

            width:              'uInt16',
            height:             'uInt16',
            bitPerPixel:        'uInt8',

            mipmapCount:        'uInt8',
            rasterType:         'uInt8',
            dxtCompression:     'uInt8'     // 12 - DXT1, 13 - DXT2, 14 - DXT3, 15 - DXT5, 0 - normal)
        });

        struct.binary.seek(4); //unknown

        let widths = [header.width];
        let heights = [header.height];

        this.result.mipmap = [];
        for (let i = 0; i < header.mipmapCount; i++) {
            if (i !== 0) {
                widths.push(widths[i-1]/2);
                heights.push(heights[i-1]/2);

                // DXT compression works on 4x4 blocks, no smaller values allowed
                if (header.dxtCompression) {
                    if (widths[i] < 4)  widths[i] = 4;
                    if (heights[i] < 4) heights[i] = 4;
                }
            }

            let dataSizes = widths[i] * heights[i];

            if (header.dxtCompression === 0)
                dataSizes *= (header.bitPerPixel/8);
            else if (header.dxtCompression === 0xC)
                dataSizes /= 2;

            this.texture.mipmaps.push({
                data: new DataView(struct.binary.consume(dataSizes, 'arraybuffer')),
                width: widths[i],
                height: widths[i]
            });
        }

        this.validateParsing(struct);

        let extension = this.processChunk(this.binary);
        assert(extension.type, Renderware.CHUNK_EXTENSION);
        assert(extension.header.size, 0);


        this.texture.width = this.texture.mipmaps[0].width;
        this.texture.height = this.texture.mipmaps[0].height;
        this.texture.name = this.result.name;

        if (header.dxtCompression      === 12)  this.texture.format = RGB_S3TC_DXT1_Format;
        else if (header.dxtCompression === 14)  this.texture.format = RGBA_S3TC_DXT3_Format;
        else if (header.dxtCompression === 15)  this.texture.format = RGBA_S3TC_DXT5_Format;
        else debugger;
    }

    parsePs2(){
        let name = this.processChunk(this.binary);
        assert(name.type, Renderware.CHUNK_STRING);
        this.result.name = name.result.name;

        let alphaName = this.processChunk(this.binary);
        assert(alphaName.type, Renderware.CHUNK_STRING);
        this.result.alphaName = alphaName.result.name;


        let struct = this.processChunk(this.binary);
        assert(struct.type, Renderware.CHUNK_STRUCT);

        let dataSize;
        {
            let structHeader = this.processChunk(struct.binary);
            assert(structHeader.type, Renderware.CHUNK_STRUCT);

            this.result.width.push(structHeader.binary.uInt32());
            this.result.height.push(structHeader.binary.uInt32());
            this.texture.bitPerPixel = structHeader.binary.uInt32();
            this.result.rasterFormat = structHeader.binary.uInt32();

            structHeader.binary.seek(8 * 4);//4*uiTex + 4*miptbp
            dataSize = structHeader.binary.uInt32();
            structHeader.binary.seek(3 * 4);//paletteDataSize, uiGpuDataAlignedSize, uiSkyMipmapVal

            this.validateParsing(structHeader);
        }

        let hasHeader = (this.result.rasterFormat & 0x20000);

        {
            let structBody = this.processChunk(struct.binary);
            assert(structBody.type, Renderware.CHUNK_STRUCT);

            let blockEnd = structBody.binary.current() + dataSize;

            let i = 0;
            while(structBody.binary.current() < blockEnd){

                if (i > 0) {
                    this.result.width.push(this.result.width[i-1]/2);
                    this.result.height.push(this.result.height[i-1]/2);
                }

                let dataSize;

                if (hasHeader){
                    structBody.binary.seek(8 * 4);
                    this.result.swizzleWidth.push(structBody.binary.uInt32());
                    this.result.swizzleHeight.push(structBody.binary.uInt32());
                    structBody.binary.seek(6 * 4);
                    dataSize = structBody.binary.uInt32() * 0x10;
                    structBody.binary.seek(3 * 4);
                }else{
                    this.result.swizzleWidth.push(this.result.width[i]);
                    this.result.swizzleHeight.push(this.result.height[i]);
                    dataSize = this.result.height[i]*this.result.height[i]*this.texture.bitPerPixel/8;
                }

                this.result.mipmap.push(structBody.binary.consume(dataSize, 'nbinary'));

                i++;
            }

            let palette = false;
            if (this.result.rasterFormat & 0x2000 || this.result.rasterFormat & 0x4000) {
                let unkh2 = 0;
                let unkh3 = 0;
                let unkh4 = 0;
                if (hasHeader){
                    structBody.binary.seek(8 * 4);
                    unkh2 = structBody.binary.uInt32();
                    unkh3 = structBody.binary.uInt32();
                    structBody.binary.seek(6 * 4);
                    unkh4 = structBody.binary.uInt32();
                    structBody.binary.seek(3 * 4);
                }

                let paletteSize = (this.result.rasterFormat & 0x2000) ? 0x100 : 0x10;
                palette = structBody.binary.consume(paletteSize * 4, "nbinary");

                if (unkh2 === 8 && unkh3 === 3 && unkh4 === 6)
                    structBody.binary.seek(0x20);

            }

            this.result.palette = palette;

            this.validateParsing(structBody);
        }

        this.result.swizzleMask = this.result.swizzleHeight[0] !== this.result.height[0] ? 0x1 : 0x00;

    }

}