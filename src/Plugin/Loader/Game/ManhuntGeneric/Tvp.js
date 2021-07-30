import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";

export default class Tvp extends AbstractLoader{
    static name = "Timed Vector Pairs (Manhunt 1/2)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        let text = binary.data.toString();

        text = text.replace(/#.*/g, '');
        let matches = text.match(/(#FORCE\n)?RECORD\s(.*\s)*?END/mig);

        return matches !== null && matches.length !== 0;
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];

        let weapon = false;

        binary.data.toString().split("\n").forEach(function (line) {
            line = line.trim();
            if (line === "END") return;
            if (line === "") return;

            if (line.indexOf('RECORD') !== -1){

                weapon = line.replace('RECORD', '').trim();
                weapon = weapon.split("#")[0];

            }else{

                results.push(new Result(
                    Studio.TVP,
                    weapon,
                    binary,
                    0,
                    {},
                    function(){
                       
                        return Tvp.parseTVPLine(line);
                    }
                ));
            }

        });


        return results;
    }

    static parseTVPLine(str){
        let parts = str.replace(/\t/g, ' ')
            .replace(/ {2}/g, ' ')
            .split(" ");

        let dur = parseFloat(parts[1]);

        if (dur !== 0.0)
            dur -= 0.01666666753590107; //exe 0x5CB40A

        return {
            type: parts[0],
            dur: dur,
            posX: parseFloat(parts[2]),
            posZ: parseFloat(parts[3]),
            posY: parseFloat(parts[4]),

            lokX: parseFloat(parts[5]),
            lokZ: parseFloat(parts[6]),
            lokY: parseFloat(parts[7]),

            thr: parseFloat(parts[8]),
            rol: parseFloat(parts[9])
        };

    }
}