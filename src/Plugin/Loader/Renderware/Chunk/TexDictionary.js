import Renderware from "./../Renderware.js";
import Chunk from "./Chunk.js";
import Helper from './../../../../Helper.js'
import TextureNative from "./TextureNative.js";
const assert = Helper.assert;

export default class TexDictionary extends Chunk{

    result = {
        textureCount: null,
        chunks: []
    };

    parse(){

        let struct = this.processChunk(this.binary);
        assert(struct.type, Renderware.CHUNK_STRUCT);

        this.rootData.textureCount = struct.binary.consume(2, 'int16');
        struct.binary.seek(2); // unk
        this.validateParsing(struct);

        for(let i = 0; i < this.rootData.textureCount; i++){
            let chunk = this.processChunk(this.binary);
            assert(chunk.type, Renderware.CHUNK_TEXTURENATIVE);
            this.result.chunks.push(chunk);
        }

        let extension = this.processChunk(this.binary);
        assert(extension.type, Renderware.CHUNK_EXTENSION);
        this.validateParsing(extension);

        this.validateParsing(this);
    }

    list(){
        let results = [];

        this.binary.seek(12); //struct header
        let textureCount = this.binary.consume(2, 'int16');
        this.binary.seek(2); //unk

        for(let i = 0; i < textureCount; i++){
            let absoluteOffset = this.binary.getAbsoluteOffset();
            let relativeOffset = this.binary.current();

            let chunk = Renderware.parseHeader(this.binary);
            assert(chunk.id, Renderware.CHUNK_TEXTURENATIVE);

            let name = (new TextureNative(this.binary, chunk, {})).list();

            results.push({
                name: name,
                offset: absoluteOffset
            });

            this.binary.setCurrent(relativeOffset);
            this.binary.seek(12 + chunk.size);
        }

        return results;
    }

}