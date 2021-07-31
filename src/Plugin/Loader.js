import { default as TextureManhunt2Pc } from "./Loader/Game/Manhunt2/Pc/Texture.js";
import { default as TextureManhunt2Psp } from "./Loader/Game/Manhunt2/Psp/Texture.js";
import { default as TextureManhunt2Wii } from "./Loader/Game/Manhunt2/Wii/Texture.js";
import { default as TextureManhuntGenericGlg } from "./Loader/Game/ManhuntGeneric/Glg.js";
import { default as TextureManhuntGenericIfp } from "./Loader/Game/ManhuntGeneric/Ifp.js";
import { default as TextureManhuntGenericInst } from "./Loader/Game/ManhuntGeneric/Inst.js";
import { default as TextureManhuntGenericMls } from "./Loader/Game/ManhuntGeneric/Mls.js";
import { default as TextureManhuntGenericTvp } from "./Loader/Game/ManhuntGeneric/Tvp.js";
import { default as ModelManhunt2Pc } from "./Loader/Game/Manhunt2/Pc/Model.js";
import { default as PakManhunt } from "./Loader/Generic/PAK.js";
import RenderwareLoader from "./Loader/Renderware.js";
import Api from "./../Api.js";
import Storage from "./../Storage.js";
import Event from "../Event.js";
import Status from "../Status.js";
import DDS from "./Loader/Generic/DDS.js";

export default class Loader{

    static plugins = [];

    /**
     *
     * @param gameId {int}
     * @param file {string}
     * @param options {{}}
     * @param callback {function}
     */
    static load( gameId, file, options, callback ){
        // Status.set(`Load File ${file}`);
        Api.load(gameId, file, function (binary) {
            let results = Loader.parse(binary, options);
            if (results === false){
                console.error("No handler found for ", file);
                debugger;
            }

            if (results.length === 0){
                console.error("Unable to parse ", file);
                debugger;
            }

            results.forEach(function (result) {
                result.setFilePath(file);

                result.gameId = gameId;
                Storage.add(result);

                Event.dispatch(Event.ENTRY_LOADED, {
                    entry: result
                });

            });

            callback();
        });
    }

    static registerPlugins(){
        /**
         * Engine related parser
         */
        Loader.registerPlugin(RenderwareLoader);
        Loader.registerPlugin(DDS);

        Loader.registerPlugin(PakManhunt);


        /**
         * Manhunt parser which works for Manhunt 1 and 2
         */
        Loader.registerPlugin(TextureManhuntGenericGlg);
        Loader.registerPlugin(TextureManhuntGenericIfp);
        Loader.registerPlugin(TextureManhuntGenericInst);
        Loader.registerPlugin(TextureManhuntGenericMls);
        Loader.registerPlugin(TextureManhuntGenericTvp);

        /**
         * Manhunt 2 parser
         */
        Loader.registerPlugin(TextureManhunt2Psp);
        Loader.registerPlugin(TextureManhunt2Pc);
        Loader.registerPlugin(TextureManhunt2Wii);
        Loader.registerPlugin(ModelManhunt2Pc);
    }

    static registerPlugin( plugin ){
        console.info("Register Loader: ", plugin.name);
        Loader.plugins.push(plugin);
    }

    /**
     *
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Array.<Result>}
     */
    static parse(binary, options){
        options = options || {};

        let current = binary.current();

        for (let i in Loader.plugins){
            if (!Loader.plugins.hasOwnProperty(i))
                continue;

            let plugin = Loader.plugins[i];
            if (plugin.canHandle(binary) === false){
                binary.setCurrent(current);
                continue;
            }
            binary.setCurrent(current);

            // Status.set(`Create List from binary (Size: ${binary.length()})`);
            return plugin.list(binary, options);
        }

        return false;
    }

}