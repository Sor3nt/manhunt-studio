import NBinary from "./../../NBinary.js";

export default class AbstractLoader{
    static name = "Unnamed Loader";

    /**
     * @param binary {NBinary}
     * @param assume {int}
     * @returns {boolean}
     */
    static checkFourCC(binary, assume){
        if (binary.remain() <= 4)
            return false;

        let fourCC = binary.consume(4, 'uint32');
        binary.seek(-4);

        return fourCC === assume;
    }

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        return false;
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){
        return [];
    }

}