import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";

export default class Mls extends AbstractLoader{
    static name = "Manhunt Level Script (Manhunt 1/2)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //MHLS
        return AbstractLoader.checkFourCC(binary,1397508173);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        binary.seek(8); //FourCC + version
        let results = [];

        do{
            let sourceInfo = Mls.getSourceOffset(binary);

            (function (info) {
                results.push(new Result(
                    Studio.MLS,
                    info.name,
                    binary,
                    info.offset,
                    {},
                    function(){
                        binary.setCurrent(info.offset);

                        let labelData2 = Mls.getLabelSizeData(binary);
                        return labelData2.binary.consume(labelData2.binary.length(), 'string');
                    }
                ));
            })(sourceInfo);

        }while(binary.remain() > 0);

        return results;
    }

    static getLabelSizeData( binary ){
        let label = binary.consume(4, 'string');
        let size = binary.consume(4, 'uint32');

        let data = binary.consume(size, 'nbinary');
        return {
            label: label,
            binary: data
        };
    }

    static getSourceOffset(binary){
        let name = "";
        do {
            let labelData = Mls.getLabelSizeData(binary);

            switch (labelData.label) {

                case 'NAME':
                    name = labelData.binary.getString(0);
                    break;
                case 'DBUG':
                    return {
                        name: name,
                        offset: binary.getAbsoluteOffset()
                    };

            }
        }while(binary.remain() > 0);
    }

}