import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";

export default class Dff extends AbstractBuilder{
    static name = "Models (Manhunt 1)";

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
            file: 'modelspc.dff',
            type: Studio.MODEL
        });


        let binary = new NBinary(new ArrayBuffer(1024 * 1024 * 10));
        modelEntries.forEach(function (model) {
            binary.append(model.props.getRawChunk());
        });

        binary.end();

        return binary;
    }
}
