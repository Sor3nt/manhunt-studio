import AbstractBuilder from "./../../Abstract.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";
import {MathUtils} from "../../../../Vendor/three.module.js";


export default class Inst extends AbstractBuilder{
    static name = "Waypoints (Manhunt 1/2)";


    static toQuaternion(yaw, pitch, roll) {
        // Abbreviations for the various angular functions
        let cy = Math.cos(yaw * 0.5);
        let sy = Math.sin(yaw * 0.5);
        let cp = Math.cos(pitch * 0.5);
        let sp = Math.sin(pitch * 0.5);
        let cr = Math.cos(roll * 0.5);
        let sr = Math.sin(roll * 0.5);

        let w = cr * cp * cy + sr * sp * sy;
        let x = sr * cp * cy - cr * sp * sy;
        let y = cr * sp * cy + sr * cp * sy;
        let z = cr * cp * sy - sr * sp * cy;

        return {
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            z: parseFloat(z.toFixed(2)),
            w: parseFloat(w.toFixed(2)),
        };
    }

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


        let instEntries = game.findBy({
            level: level,
            file: fileName,
            type: Studio.INST
        });

        console.log("we save", instEntries.length);
        // append record count
        let binary = new NBinary(new ArrayBuffer(1024 * 1024));

        // if (platform == MHT::PLATFORM_WII) binary->numericBigEndian = true;

        //set count
        binary.setInt32(instEntries.length);

        let recordBin = [];

        instEntries.forEach(function (instEntry) {

            let entry = new NBinary(new ArrayBuffer(1024 * 1024));

            /*
             * Append GlgRecord name
             */
            entry.writeString(instEntry.props.glgRecord, 0x00, true, 0x70);

            /*
             * Append Internal name
             */
            console.log("write", instEntry.data().name);
            entry.writeString(instEntry.data().name, 0x00, true, 0x70);

            let mesh = instEntry.entity.mesh;
            if (mesh === undefined){
                console.info(`The INST ${instEntry.data().name} has no Mesh. Reuse given coords`);

                entry.setFloat32(instEntry.data().position.x);
                entry.setFloat32(instEntry.data().position.z * -1);
                entry.setFloat32(instEntry.data().position.y);

                entry.setFloat32(instEntry.data().rotation.x);
                entry.setFloat32(instEntry.data().rotation.y);
                entry.setFloat32(instEntry.data().rotation.z);
                entry.setFloat32(instEntry.data().rotation.w);

            }else{
                entry.setFloat32(mesh.position.x);
                entry.setFloat32(mesh.position.z * -1);
                entry.setFloat32(mesh.position.y);


                console.log("have",mesh.quaternion, "need", instEntry.data().rotation);
                entry.setFloat32(mesh.quaternion.x);
                entry.setFloat32(mesh.quaternion.z);
                entry.setFloat32(mesh.quaternion.y);
                entry.setFloat32(mesh.quaternion.w);

            }


            /*
             * Append entity class
             */
            if (instEntry.data().entityClass){
                entry.writeString(instEntry.data().entityClass, 0x00, true, 0x70);
            }

            /*
             * Append parameters
             */
            instEntry.data().settings.forEach(function (setting) {
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
