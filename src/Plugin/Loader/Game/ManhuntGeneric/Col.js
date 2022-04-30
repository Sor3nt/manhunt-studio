import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";

export default class Col extends AbstractLoader{
    static name = "Collisions (Manhunt 1/2)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        function isNormal(n){
            return (n <= 1.0 && n >= 0.0) || n === -0;
        }

        if (binary.remain() <= 0) return false;

        let count = binary.consume(4, 'int32');
        if (count === 1413759828) return false; // TCDT (PSP 0.01 txd)
        if (count < 0) return false;

        binary.getString(0x00, true);
        if (binary.remain() < 10 * 4) return false;
        let xyz = binary.readXYZ();
        return isNormal(xyz.x) && isNormal(xyz.y) && isNormal(xyz.z);

    }

    static getChunkInfo(binary){
        let startOffset = binary.current();

        let name = binary.getString(0x00, true);
        binary.seek(10 * 4);

        let spheresCount = binary.consume(4, 'int32');
        binary.seek((5 * 4) * spheresCount);

        let lineCount = binary.consume(4, 'int32');
        binary.seek((6 * 4) * lineCount);

        let boxesCount = binary.consume(4, 'int32');
        binary.seek((7 * 4) * boxesCount);

        let verticalCount = binary.consume(4, 'int32');
        binary.seek((3 * 4) * verticalCount);

        let faceCount = binary.consume(4, 'int32');
        binary.seek((3 * 4) * faceCount);

        return {
            name: name,
            offset: startOffset,
            size: binary.current() - startOffset
        };
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        let results = [];

        let count = binary.consume(4, 'int32');

        while(count--){
            let chunk = Col.getChunkInfo(binary);

            let result = new Result(
                Studio.COLLISION,
                chunk.name,
                binary.data,
                chunk.offset,
                {

                    /**
                     * @return {NBinary}
                     */
                    getRawChunk: function () {
                        binary.setCurrent( chunk.offset  );
                        return binary.consume(chunk.size, 'nbinary');
                    }
                },
                function(){
                    alert("Not implemented fully !!");
                    debugger;
                    return Col.parse(binary, chunk.offset, chunk.size);
                }
            );

            results.push(result);
        }

        return results;
    }

    /**
     *
     * @param binary {NBinary}
     * @param offset {int}
     * @param size {int}
     * @returns {{}}
     */
    static parse(binary, offset, size){
        binary.setCurrent(offset);

        let result = {
            name: binary.getString(0x00, true),
            center: binary.readXYZ(),
            radius: binary.float32(),
            min: binary.readXYZ(),
            max: binary.readXYZ(),
            spheres: []
        };

        let spheresCount = binary.consume(4, 'int32');
        while(spheresCount--){

            result.spheres.push({
                center: binary.readXYZ(),
                radius: binary.float32(),
                surface: {
                    material: binary.int8(),
                    flag: binary.int8(),
                    brightness: binary.int8(),
                    light: binary.int8(),
                }
            });

        }

        return result;
    }

}
