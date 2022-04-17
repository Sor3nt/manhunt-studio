
import {downloadZip} from "./Vendor/Zip.js";
import StudioScene from "./Scene/StudioScene.js";
import SceneMap from "./Scene/SceneMap.js";

export default class Save{

    /**
     *
     * @param binary {NBinary}
     * @param filename {string}
     */
    static async output(binary, filename){
        let files = [{
            name: filename,
            lastModified: new Date(),
            input: new Uint8Array(binary.data)
        }];

        let blob = new Blob( [ files[0].input ], { type: 'application/octet-stream' } );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = files[0].name;
        link.click();
        link.remove();
    }

    /**
     *
     * @param data {{binary: NBinary, name: string}[]}
     */
    static async outputZip(data){

        let level = "unknown-level";
        let studioScene = StudioScene.getStudioSceneInfo(undefined).studioScene;
        if (studioScene instanceof SceneMap) {
            level = studioScene.mapEntry.level;
        }


        let files = [];
        data.forEach(function (file) {
            files.push({
                name: file.name,
                lastModified: new Date(),
                input: new Uint8Array(file.binary.data)
            });

        });

        let blob = await downloadZip(files).blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = level + '.zip';
        link.click();
        link.remove();
    }



}
