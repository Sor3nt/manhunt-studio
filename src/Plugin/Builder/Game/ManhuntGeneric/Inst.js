import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";

export default class Inst extends AbstractBuilder{
    static name = "Waypoints (Manhunt 1/2)";

    /**
     * @param game {Game}
     * @param level {string}
     * @param isEntity2 {boolean}
     * @returns {NBinary}
     */
    static build(game, level, isEntity2){

        let fileName = isEntity2 ? 'entity2.inst' : 'entity.inst';
        if (game.game === Games.GAMES.MANHUNT_2)
            fileName = 'entity_pc.inst';

        /**
         *
         * @type Result[]
         */
        let instEntries = game.findBy({
            level: level,
            file: fileName,
            type: Studio.INST
        });

        let binary = new NBinary(new ArrayBuffer(1024 * 1024));

        //set count
        binary.setInt32(instEntries.length);

        let recordBin = [];

        instEntries.forEach(function (instEntry) {

            /**
             * @var instEntry {Result}
             */
            let instData = instEntry.data();

            let entry = new NBinary(new ArrayBuffer(1024 * 1024));

            /*
             * Append GlgRecord name
             */
            entry.writeString(instEntry.props.glgRecord, 0x00, true, 0x70);

            /*
             * Append Internal name
             */
            entry.writeString(instData.name, 0x00, true, 0x70);


            /*
             * Create Position and Rotations
             */
            let mesh = instEntry.entity.mesh;
            let position = instData.position;
            let rotation = instData.rotation;

            if (mesh !== undefined){
                position = mesh.position;
                rotation = mesh.quaternion;
            }

            entry.setFloat32(position.x);
            entry.setFloat32(position.z * -1);
            entry.setFloat32(position.y);

            entry.setFloat32(rotation.x);
            entry.setFloat32(rotation.z * -1);
            entry.setFloat32(rotation.y * -1);
            entry.setFloat32(rotation.w);

            /*
             * Append entity class
             */
            if (instData.entityClass){
                entry.writeString(instData.entityClass, 0x00, true, 0x70);
            }

            /*
             * Append parameters
             */
            instData.settings.forEach(function (setting) {
                if (game.game === Games.GAMES.MANHUNT_2){
                    if (setting.hash === false){
                        console.log("INST Porting MH1 to MH2 not implemented");
                        return;
                    }

                    entry.setInt32(setting.hash);
                    entry.writeString(setting.type, 0x00, true, 0x70);
                }

                switch (setting.type) {
                    case 'flo':
                        entry.setFloat32(setting.value);
                        break;

                    case 'boo':
                    case 'int':
                        entry.setInt32(setting.value);
                        break;

                    case 'str':
                        entry.writeString(setting.value, 0x00, true, 0x70);
                        break;
                }
            });

            entry.end();

            recordBin.push(entry);
        });

        // build size header
        recordBin.forEach(function (entry) {
            binary.setInt32(entry.length())
        });

        // append records
        recordBin.forEach(function (entry) {
            binary.append(entry);
        });

        binary.end();

        return binary;
    }
}
