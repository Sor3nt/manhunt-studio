import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";

export default class Col extends AbstractBuilder{
    static name = "Collisions (Manhunt 1/2)";

    /**
     * @param game {Game}
     * @param level {string}
     * @returns {NBinary}
     */
    static build(game, level){

        let fileName = 'collisions.col';
        if (game.game === Games.GAMES.MANHUNT_2)
            fileName = 'collisions_pc.col';

        /**
         *
         * @type Result[]
         */
        let colEntries = game.findBy({
            level: level,
            file: fileName,
            type: Studio.COLLISION
        });

        let binary = new NBinary(new ArrayBuffer(1024 * 1024));

        //set count
        binary.setInt32(colEntries.length);

        colEntries.forEach(function (col) {
            binary.append(col.props.getRawChunk());
        });

        binary.end();

        return binary;
    }
}
