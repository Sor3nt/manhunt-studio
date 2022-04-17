import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Renderware from "../../../Loader/Renderware/Renderware.js";

export default class Txd extends AbstractBuilder{
    static name = "Texture (Manhunt 1)";

    /**
     * @param game {Game}
     * @param level {string}
     * @returns {NBinary}
     */
    static build(game, level){

        /**
         *
         * @type Result[]
         */
        let modelEntries = game.findBy({
            level: level,
            file: 'modelspc.txd',
            type: Studio.TEXTURE
        });


        let data = new NBinary(new ArrayBuffer(1024 * 1024 * 10));
        modelEntries.forEach(function (model) {
            data.append(model.props.getRawChunk());
        });
        data.end();


        let binary = new NBinary(new ArrayBuffer(1024 * 1024 * 10));

        binary.setUInt32(Renderware.CHUNK_TEXDICTIONARY);
        // struct header (12) + count (4) + Data Size + extension header (12)
        binary.setUInt32(12 + 4 + data.length() + 12);
        binary.setUInt32(402915327); // Version (FF FF 03 18)

        binary.setUInt32(Renderware.CHUNK_STRUCT);
        binary.setUInt32(4);
        binary.setUInt32(402915327); // Version (FF FF 03 18)

        binary.setUInt16(modelEntries.length);
        binary.setUInt16(1);
        binary.append(data);

        binary.setUInt32(Renderware.CHUNK_EXTENSION);
        binary.setUInt32(0);
        binary.setUInt32(402915327); // Version (FF FF 03 18)

        binary.end();

        return binary;
    }
}
