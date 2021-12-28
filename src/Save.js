import Storage from "./Storage.js";
import Studio from "./Studio.js";
import Inst from "./Plugin/Loader/Game/ManhuntGeneric/Inst.js";
import {downloadZip} from "./Vendor/Zip.js";

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

    static async save(){

        let changedEntries = Storage.findBy({
            hasChanges: true
        });


        let files = [];
        let filesTouched = [];
        changedEntries.forEach(function (entry) {
            if (entry.type !== Studio.INST) return;
            Inst.update(entry);

            //todo, just a hack
            let filename = entry.file;
            if (entry.file.indexOf('/') !== -1){
                filename = entry.file.split("/");
                filename = filename[filename.length - 1];
            }else if (entry.file.indexOf('\\') !== -1){
                filename = entry.file.split('\\');
                filename = filename[filename.length - 1];
            }


            if (filesTouched.indexOf(filename) === -1){
                filesTouched.push(filename);

                files.push({
                    name: filename,
                    lastModified: new Date(),
                    input: new Uint8Array(entry.binary.data)
                });
            }

        });

        let blob, name;

        if (files.length > 1){
            blob = await downloadZip(files).blob();
            name = "Modifications.zip";
        }else if (files.length === 1){
            blob = new Blob( [ files[0].input ], { type: 'application/octet-stream' } );
            name = files[0].name;
        }else{
            return;
        }

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
        link.remove();

    }



}