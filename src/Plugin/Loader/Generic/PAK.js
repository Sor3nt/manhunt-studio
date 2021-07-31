import AbstractLoader from "../Abstract.js";
import Result from "../Result.js";
import {NormalizedTexture} from "../../../Normalize/texture.js";
import Studio from "../../../Studio.js";
import Glg from "../Game/ManhuntGeneric/Glg.js";

export default class PAK extends AbstractLoader{
    static name = "Manhunt Package";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //MHPK
        return AbstractLoader.checkFourCC(binary,1263552589);
    }

    /**
     *
     * @param str {string}
     * @returns {string}
     */
    static xorCrypt(str) {
        let key = "\x7f";

        var ord = []; var res = "";

        var i;
        for (i = 1; i <= 255; i++) {ord[String.fromCharCode(i)] = i}

        for (i = 0; i < str.length; i++)
            res += String.fromCharCode(ord[str.substr(i, 1)] ^ ord[key.substr(i %    key.length, 1)]);

        return(res);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){
        binary.seek(8);
        let results = [];

        let count = binary.uInt32();
        let list = [];
        for(let i = 0; i < count; i++){
            let name = binary.consume(260, 'nbinary').getString(0);
            name = name.replace('//', '/');

            let size = binary.uInt32();
            let offset = binary.uInt32();
            binary.seek(8); //unk & crc

            list.push({
                name: name,
                offset: offset,
                size: size
            });

        }

        list.forEach(function (row) {
            if (row.name.indexOf('entityTypeData.ini') !== -1){
                binary.setCurrent(row.offset);
                let glg = binary.consume(row.size, 'string');
                glg = PAK.xorCrypt(glg);

                let list = Glg.list(glg);
                list.forEach(function (entry) {
                    entry.setFilePath(row.name);
                    results.push(entry);
                });

            }else{
                let file = new Result(
                    Studio.FILE,
                    row.name,
                    binary,
                    row.offset,
                    {
                        size: row.size
                    },
                    function(offset, props){
                        binary.setCurrent(offset);

                        let data = binary.consume(props.size, 'string');
                        data = PAK.xorCrypt(data);
                        return data;
                    }
                );
                file.setFilePath(row.name);
                results.push(file);
            }
        });

        return results;
    }


}