import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";

export default class Glg extends AbstractBuilder{
    static name = "Model Config (INI/GLG Manhunt 1/2)";

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
        let glgEntries = game.findBy({
            level: level,
            file: game.game === Games.GAMES.MANHUNT ? 'entityTypeData.ini' : 'resource3.glg',
            type: Studio.GLG
        });


        let binary = new NBinary(new ArrayBuffer(1024 * 1024));
        if (game.game === Games.GAMES.MANHUNT){

            var enc = new TextEncoder();
            let buffer = enc.encode("# Player Character2\n\n").buffer;
            binary.append(new NBinary(buffer))
        }
        glgEntries.forEach(function (glg) {
            binary.append(glg.props.getRawChunk());
        });

        binary.end();

        return binary;
    }
}
