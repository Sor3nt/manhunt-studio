import Renderware from "./../Renderware.js";
import Helper from './../../../../Helper.js'
import Chunk from "./Chunk.js";
const assert = Helper.assert;

export default class TextureNative extends Chunk{

    texture = {
        mipmapCount: 1,
        mipmaps: [],
        width: 0,
        height: 0,
        format: 0
    };

    result = {
        platform: null,
        filterFlags: null,
        name: null,
        alphaName: null,
        rasterFormat: null,
        width: [],
        height: [],
        depth: null,
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
                platform = this.binary.consume(4, 'uint32');
                break;

            default:
                platform = this.binary.consume(4, 'uint32');
                break;


        }

        let name = "unknown";
        switch (platform) {
            case Renderware.PLATFORM_PS2:
            case Renderware.PLATFORM_PS2FOURCC:
                this.binary.seek(12); //string header
                name = this.binary.getString(0);
                break;

            case Renderware.PLATFORM_XBOX:

                this.binary.seek(4); //filterFlag
                name = this.binary.consume(32, 'nbinary').getString(0);

                break;

            case Renderware.PLATFORM_D3D8:
            case Renderware.PLATFORM_D3D9:

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

            this.result.platform = struct.binary.consume(4, 'uint32');
            this.result.filterFlags = struct.binary.consume(4, 'uint32');

            if (this.result.platform === Renderware.PLATFORM_PS2){
                this.validateParsing(struct);
            }else{
                struct.binary.seek(-4);
            }
        }

        else if (struct.header.version === 784){

            this.result.platform = Renderware.PLATFORM_D3D9;
            this.result.filterFlagsUnnk = struct.binary.consume(1, 'uint8');
            this.result.addrModeU = struct.binary.consume(1, 'uint8');
            this.result.addrModeV = struct.binary.consume(1, 'uint8');
            struct.binary.seek(1); //padding

        }else{

            this.result.platform = struct.binary.consume(4, 'uint32');

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


        if (this.result.platform !== Renderware.PLATFORM_XBOX){

            while(this.binary.remain() > 0){
                this.result.chunks.push(this.processChunk(this.binary));
            }
            this.validateParsing(this);
        }

    }

    parsePc(struct){

        let nameLen = 32;
        if (struct.header.version === 784){
            nameLen = 128;
        }

        this.result.filterFlags = struct.binary.consume(4, 'uint32');
        this.result.name = struct.binary.consume(nameLen, 'nbinary').getString(0);
        this.result.alphaName = struct.binary.consume(nameLen, 'nbinary').getString(0);
        this.result.rasterFormat = struct.binary.consume(4, 'uint32');
        this.result.d3dTextureFormat = struct.binary.consume(4, 'uint32');
        this.result.width = [struct.binary.consume(2, 'uint16')];
        this.result.height = [struct.binary.consume(2, 'uint16')];
        this.result.depth = struct.binary.consume(1, 'uint8');
        let mipmapCount = struct.binary.consume(1, 'uint8');

        this.result.rasterType = struct.binary.consume(1, 'uint8');
        this.result.dxtCompression = struct.binary.consume(1, 'uint8');

        this.result.hasAlpha = false;
        if (this.result.platform === Renderware.PLATFORM_D3D9){
            this.result.hasAlpha = this.result.dxtCompression & 0x1;
        }

        let bufferSize = struct.binary.consume(4, 'uint32');


        assert(bufferSize, struct.binary.remain(), "remained data does not match!");
// console.log("ee", struct.binary.consume(bufferSize, 'nbinary'));
// die;

        this.texture.mipmaps.push({
            data: struct.binary.consume(bufferSize, 'dataview'),
            width: this.result.width[0],
            height: this.result.height[0]
        });

        this.texture.width = this.result.width[0];
        this.texture.height = this.result.height[0];
        this.texture.name = this.result.name;

        // this.result.mipmap = [];
        // this.result.mipmap.push(new  DataView(struct.binary.consume(bufferSize, 'arraybuffer')));

        // console.log(this.result.rasterType);

        // this.result.mipmap = [];
        // for (let i = 0; i < mipmapCount; i++) {
        //     if (i !== 0) {
        //         this.result.width.push(this.result.width[i-1]/2);
        //         this.result.height.push(this.result.height[i-1]/2);
        //     }
        //
        //     let dataSize = (this.result.height[i]*this.result.height[i]) / 2;
        //     this.result.mipmap.push(struct.binary.consume(dataSize, 'dataview'));
        //
        // }

        this.validateParsing(struct);

        while(this.binary.remain() > 0){
            this.result.chunks.push(this.processChunk(this.binary));
        }

        this.validateParsing(this);

    }

    parseXbox(struct){

        /**
         // 4354= 16bit <- ALWAYS IF XBOX
         // 4358= 8bpp
         // 4354= 32bpp
         // 4358= DXT3
         // 0000= DXT1
         // 4354= NONRECOMPRESIBLE DXT - hud and such images.
         */
        this.result.filterFlags = struct.binary.consume(4, 'uint32');

        this.result.name = struct.binary.consume(32, 'nbinary').getString(0);
        this.result.alphaName = struct.binary.consume(32, 'nbinary').getString(0);

        /**
         // alpha flags
         // 512 = 16bpp no alpha
         // 768 = 16bpp with alpha

         // 9728= 8bpp no alpha
         // 9472= 8bpp with alpha

         // 1536= 32bpp no alpha   < -+- SET IF ANY XBOX
         // 1280= 32bpp with alpha < /

         // 512? = dxt1 no alpha
         // 768 = dxt3 with alpha
         // ? = dxt3 no alpha

         // 256 = used in generic.txd (first of 2 duplicates in img file)
         // and in hud.txd too

         // 6 = was used for body in ashdexx's sample
         // custom xbox working txd
         */
        this.result.rasterFormat = struct.binary.consume(4, 'uint32');
        this.result.hasAlpha = struct.binary.consume(4, 'uint32');
        this.result.width.push(struct.binary.consume(2, 'uint16'));
        this.result.height.push(struct.binary.consume(2, 'uint16'));
        this.result.depth = struct.binary.consume(1, 'uint8');
        this.result.mipmapCount = struct.binary.consume(1, 'uint8');
        this.result.rasterType = struct.binary.consume(1, 'uint8');
        assert(this.result.rasterType, 4, "RasterType should be always 4 but it is " + this.result.rasterType);

        // 12 - DXT1, 13 - DXT2, 14 - DXT3, 15 - DXT5, 0 - normal)
        this.result.dxtCompression = struct.binary.consume(1, 'uint8');

        struct.binary.seek(4); //unknown

        console.log("dxtCompression", this.result.dxtCompression);

        this.result.mipmap = [];
        for (let i = 0; i < this.result.mipmapCount; i++) {
            if (i !== 0) {
                this.result.width.push(this.result.width[i-1]/2);
                this.result.height.push(this.result.height[i-1]/2);

                // DXT compression works on 4x4 blocks,
                // no smaller values allowed
                if (this.result.dxtCompression) {
                    if (this.result.width[i] < 4)
                        this.result.width[i] = 4;
                    if (this.result.height[i] < 4)
                        this.result.height[i] = 4;
                }
            }

            let dataSizes = this.result.width[i] * this.result.height[i];
            // console.log(this.result.dxtCompression === 0xC, dataSizes);
            // if (this.result.dxtCompression === 0)
            //     dataSizes *= (this.result.depth/8);
            // else
            if (this.result.dxtCompression === 0xC)
                dataSizes /= 2;
            //
            // console.log(this.result.dxtCompression === 0xC, dataSizes);
            // die;

            this.texture.mipmaps.push({
                data: new DataView(struct.binary.consume(dataSizes, 'arraybuffer')),
                width: this.result.height[i],
                height: this.result.height[i]
            });

        }

        assert(struct.binary.remain(), 0, 'CHUNK_TEXTURENATIVE XBOX struct: Unable to parse fully the data! Remain ' + struct.binary.remain());

        let extension = this.processChunk(this.binary);
        assert(extension.type, Renderware.CHUNK_EXTENSION);
        assert(extension.header.size, 0);

        this.validateParsing(struct);


        this.texture.width = this.texture.mipmaps[0].width;
        this.texture.height = this.texture.mipmaps[0].height;
        this.texture.name = this.result.name;
        this.texture.format = Renderware.RASTER_8888;
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

            this.result.width.push(structHeader.binary.consume(4, 'uint32'));
            this.result.height.push(structHeader.binary.consume(4, 'uint32'));
            this.result.depth = structHeader.binary.consume(4, 'uint32');
            this.result.rasterFormat = structHeader.binary.consume(4, 'uint32');

            structHeader.binary.seek(8 * 4);//4*uiTex + 4*miptbp
            dataSize = structHeader.binary.consume(4, 'uint32');
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
                    this.result.swizzleWidth.push(structBody.binary.consume(4, 'uint32'));
                    this.result.swizzleHeight.push(structBody.binary.consume(4, 'uint32'));
                    structBody.binary.seek(6 * 4);
                    dataSize = structBody.binary.consume(4, 'uint32') * 0x10;
                    structBody.binary.seek(3 * 4);
                }else{
                    this.result.swizzleWidth.push(this.result.width[i]);
                    this.result.swizzleHeight.push(this.result.height[i]);
                    dataSize = this.result.height[i]*this.result.height[i]*this.result.depth/8;
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
                    unkh2 = structBody.binary.consume(4, 'uint32');
                    unkh3 = structBody.binary.consume(4, 'uint32');
                    structBody.binary.seek(6 * 4);
                    unkh4 = structBody.binary.consume(4, 'uint32');
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


//     convertTo32Bit() {
//         // depth is always 8 (even if the palette is 4 bit)
//         if (this.result.rasterFormat & Renderware.RASTER_PAL8 || this.result.rasterFormat & Renderware.RASTER_PAL4) {
//             for (let j = 0; j < this.result.mipmapCount; j++) {
//                 let dataSize = this.result.width[j] * this.result.height[j] * 4;
//                 let newtexels = new Uint8Array(dataSize);
//                 for (let i = 0; i < this.result.width[j] * this.result.height[j]; i++) {
//                     // swap r and b
//                     newtexels.setUint8(i * 4 + 2, this.result.palette.getUint8(this.texture.mipmaps[j].getUint8(i) * 4));
//                     newtexels.setUint8(i * 4 + 1, this.result.palette.getUint8(this.texture.mipmaps[j].getUint8(i) * 4 + 1));
//                     newtexels.setUint8(i * 4, this.result.palette.getUint8(this.texture.mipmaps[j].getUint8(i) * 4 + 2));
//                     newtexels.setUint8(i * 4 + 3, this.result.palette.getUint8(this.texture.mipmaps[j].getUint8(i) * 4 + 3));
//                 }
// console.log("neew 1", newtexels);
//                 this.texture.mipmaps[j] = newtexels;
//             }
//
//             this.result.rasterFormat &= ~(Renderware.RASTER_PAL4 | Renderware.RASTER_PAL8);
//             this.result.depth = 0x20;
//
//         }
//
//         else if ((this.result.rasterFormat & Renderware.RASTER_MASK) === this.result.RASTER_1555) {
//             for (let j = 0; j < this.result.mipmapCount; j++) {
//                 let dataSize = this.result.width[j] * this.result.height[j] * 4;
//                 let newtexels = new Uint8Array(dataSize);
//                 for (let i = 0; i < this.result.width[j] * this.result.height[j]; i++) {
//                     let col = this.texture.mipmaps[j].getUInt16(i * 2);
//                     newtexels.setUint8(i * 4, ((col & 0x001F) >> 0x0) * 0xFF / 0x1F);
//                     newtexels.setUint8(i * 4 + 1, ((col & 0x03E0) >> 0x5) * 0xFF / 0x1F);
//                     newtexels.setUint8(i * 4 + 2, ((col & 0x7C00) >> 0xa) * 0xFF / 0x1F);
//                     newtexels.setUint8(i * 4 + 3, ((col & 0x8000) >> 0xf) * 0xFF);
//                 }
//                 console.log("neew 2", newtexels);
//                 this.texture.mipmaps[j] = newtexels;
//             }
//
//             this.result.rasterFormat = Renderware.RASTER_8888;
//             this.result.depth = 0x20;
//
//         }
//
//         else if ((this.result.rasterFormat & Renderware.RASTER_MASK) === Renderware.RASTER_565) {
//             for (let j = 0; j < this.result.mipmapCount; j++) {
//                 let dataSize = this.texture.mipmaps[j].width * this.texture.mipmaps[j].height * 4;
//                 let newtexels = new ArrayBuffer(dataSize);
//                 let view = new DataView(newtexels);
//
//                 for (let i = 0; i < this.texture.mipmaps[j].width * this.texture.mipmaps[j].height; i++) {
//
//                     let col = this.texture.mipmaps[j].data.getUint16(i * 2);
//                     view.setUint8(i * 4, ((col & 0x001F) >> 0x0) * 0xFF / 0x1);
//                     view.setUint8(i * 4 + 1, ((col & 0x07E0) >> 0x5) * 0xFF / 0x3F);
//                     view.setUint8(i * 4 + 2, ((col & 0xF800) >> 0xb) * 0xFF / 0x1F);
//                     view.setUint8(i * 4 + 3, 255);
//                 }
//                 // console.log("neew 3", view);
//                 this.texture.mipmaps[j].data = view;
//             }
//             this.result.rasterFormat = Renderware.RASTER_888;
//             this.result.depth = 0x20;
//         }
//
//         else if ((this.result.rasterFormat & Renderware.RASTER_MASK) === Renderware.RASTER_4444) {
//             for (let j = 0; j < this.result.mipmapCount; j++) {
//                 let dataSize = this.result.width[j] * this.result.height[j] * 4;
//                 let newtexels = new Uint8Array(dataSize);
//                 for (let i = 0; i < this.result.width[j] * this.result.height[j]; i++) {
//                     let col = this.texture.mipmaps[j].getUInt16(i * 2);
//                     // swap r and b
//                     newtexels.setUint8(i * 4, ((col & 0x000F) >> 0x0) * 0xFF / 0xF);
//                     newtexels.setUint8(i * 4 + 1, ((col & 0x00F0) >> 0x4) * 0xFF / 0xF);
//                     newtexels.setUint8(i * 4 + 2, ((col & 0x0F00) >> 0x8) * 0xFF / 0xF);
//                     newtexels.setUint8(i * 4 + 3, ((col & 0xF000) >> 0xc) * 0xFF / 0xF);
//                 }
//                 console.log("neew 4", newtexels);
//                 this.texture.mipmaps[j] = newtexels;
//             }
//             this.result.rasterFormat = Renderware.RASTER_8888;
//             this.result.depth = 0x20;
//         }else{
//             // no support for other raster formats yet
//             debugger;
//         }
//     }
}