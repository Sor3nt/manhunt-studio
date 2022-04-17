import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import {Vector2, Vector3,Vector4} from "./../../../../Vendor/three.module.js";

export default class Glg extends AbstractLoader{
    static name = "Model Config (INI/GLG Manhunt 1/2)";

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        let text = binary.toString();

        text = text.replace(/\#.*/g, '');
        var matches = text.match(/(\#FORCE\n)?RECORD\s(.*\s)*?END/mig);

        return matches !== null && matches.length !== 0;
    }

    static parseRecord( data, name){
        let options = [];
        data.forEach(function (singleOption) {

            singleOption = singleOption.trim();

            if (singleOption === "") return;
            if (singleOption.indexOf('#') === 0) return;


            if (singleOption.indexOf(' ') !== -1 || singleOption.indexOf("\t") !== -1){

                singleOption = singleOption.replace(/\t/g, ' ');
                singleOption = singleOption.replace(/\s+/g, ' ');
                var attrValue = singleOption.split(' ');

                let attr = attrValue[0].trim();
                let value = singleOption.substr(attr.length + 1).trim();

                if (['LOD_DATA'].indexOf(attr) !== -1) {
                    let vec4 = [];
                    value.split(',').forEach(function (val) {
                        vec4.push(parseInt(val))
                    });

                    value = vec4;

                }else if (['HOLSTER_ROTATION', 'STRAP1_ROTATION', 'STRAP2_ROTATION'].indexOf(attr) !== -1){
                    let vec4 = [];
                    value.split(',').forEach(function (val) {
                        vec4.push( parseFloat(val) )
                    });

                    value = new Vector4(vec4[0],vec4[1],vec4[2],vec4[3]);

                }else if ([
                    'HOLSTER_TRANSLATION',
                    'STRAP1_TRANSLATION',
                    'STRAP2_TRANSLATION',
                    'FLASH_POS',
                    'OBSTRUCT_POINT',
                    'OBSTRUCT_POINT_ZOOM'
                ].indexOf(attr) !== -1){

                    let vec3 = [];
                    value.split(',').forEach(function (val) {
                        vec3.push( parseFloat(val) )
                    });

                    value = new Vector3(vec3[0],vec3[1],vec3[2]);

                }else if (['MOVE_THRESHOLDS', 'AIM_LOCKON_ANGLES', 'EXECUTE_STAGE_TIMES', 'EXECUTE_STAGE_TIMES'].indexOf(attr) !== -1){
                    let vec2 = [];
                    value.split(',').forEach(function (val) {
                        vec2.push( parseFloat(val) )
                    });

                    value = new Vector2(vec2[0],vec2[1]);

                }else if (['ZOOM_LEVELS', 'ZOOM_MAX_ZONES'].indexOf(attr) !== -1){
                    let vec2 = [];
                    value.split(',').forEach(function (val) {
                        vec2.push( parseInt(val) )
                    });

                    value = vec2;
                }

                options.push({
                    'attr' : attr,
                    'value' : value
                });

            }else{
                options.push({
                    'attr' : singleOption
                });
            }
        });

        return options;
    }

    static createResult(name, binary, options, force){
        let result = new Result(
            Studio.GLG,
            name,
            binary,
            0,
            {

                /**
                 * @return {NBinary}
                 */
                getRawChunk: function () {
                    function prepareFloat( val) {
                        let txt = val + "";
                        if (txt === "0")
                            txt = "0.0";
                        else if (txt.indexOf('.') === -1){
                            txt += '.0';
                        }

                        return txt;
                    }


                    let data = "";
                    options.forEach(function (option) {
                        if (option.value instanceof Vector4) {
                            data += `    ${option.attr} ${prepareFloat(option.value.x)},${prepareFloat(option.value.y)},${prepareFloat(option.value.z)},${prepareFloat(option.value.w)}\n`;

                        }else if (option.value instanceof Vector3){
                            data += `    ${option.attr} ${prepareFloat(option.value.x)},${prepareFloat(option.value.y)},${prepareFloat(option.value.z)}\n`;

                        }else if (option.value instanceof Vector2){
                            data += `    ${option.attr} ${prepareFloat(option.value.x)},${prepareFloat(option.value.y)}\n`;
                        }else if (Array.isArray(option.value)){
                            data += `    ${option.attr} ${option.value.join(',')}\n`;

                        }else{
                            data += "    " + option.attr + (typeof option.value === "undefined" ? "" : " " + option.value) + "\n";
                        }
                    });

                    let record = `RECORD ${name}\n${data}END\n\n`;
                    if (force)
                        record = "#FORCE\n" + record;

                    var enc = new TextEncoder();
                    let buffer = enc.encode(record).buffer;
                    return new NBinary(buffer);
                },

                getValue: function(attr){
                    if (attr === "NAME") return name;

                    var found = false;
                    options.forEach(function (option) {
                        if (option.attr === attr) found = typeof option.value === "undefined" ? true : option.value;
                    });

                    if (found === "") found = false;

                    return found;
                },
                getValues: function(attr, index){
                    if (attr === "NAME") return [name];

                    var found = [];
                    options.forEach(function (option) {
                        if (option.attr === attr) found.push(option.value);
                    });

                    if (typeof index !== "undefined") return found[index];

                    return found;
                }
            },
            function(){
                return options;
            }
        );

        result.props.class = result.props.getValue('CLASS');
        result.props.model = result.props.getValue('MODEL');
        result.props.force = force;

        return result;

    }

    /**
     *
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        if (
            options.fileNamePath.indexOf('entityTypeData.ini') === -1 &&
            options.fileNamePath.indexOf('resource3.glg') === -1
        ) return [];

        let results = [];

        let text = binary.toString();
        var matches = text.match(/(\#FORCE\n)?RECORD\s(.*\s)*?END/mig);
        // var matches = text.match(/(\#FORCE\n)?RECORD\s(.*\s)*?END/mig);
        matches.forEach(function (match) {

            let force = match.indexOf('#FORCE') !== -1;

            match = match.replace(/#.*/g, '').trim();
            match = match.replace(/\r/g, '');
            match = match.substr(7);

            var optionsRaw = match.split("\n");
            var name = optionsRaw[0];

            // if (name === "dummy") return;
            delete optionsRaw[0];
            delete optionsRaw[optionsRaw.length - 1];

            let options = Glg.parseRecord(optionsRaw, name);

            let result = Glg.createResult(name, binary, options, force);

            results.push(result);


        });

        return results;
    }

}
