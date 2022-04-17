import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import {Vector4} from "./../../../../Vendor/three.module.js";

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

                var attr = attrValue[0].trim();
                var value = attrValue[1].trim();

                if (attr === "LOD_DATA"){
                    var vec4 = [];
                    value.split(',').forEach(function (val) {
                        vec4.push( parseInt(val) )
                    });

                    value = new Vector4(vec4[0],vec4[1],vec4[2],vec4[3]);
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
                    var enc = new TextEncoder();

                    let data = "";
                    options.forEach(function (option) {
                        data += "    " + option.attr + (typeof option.value === "undefined" ? "" : " " + option.value) + "\n";
                    });

                    let record = `RECORD ${name}\n${data}END\n\n`;
                    if (force)
                        record = "#FORCE\n" + record;

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

            if (name === "dummy") return;
            delete optionsRaw[0];
            delete optionsRaw[optionsRaw.length - 1];

            let options = Glg.parseRecord(optionsRaw, name);

            let result = Glg.createResult(name, binary, options, force);

            results.push(result);


        });
        console.log(results);

        return results;
    }

}
