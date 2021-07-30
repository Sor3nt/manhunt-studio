import Storage from "./Storage.js";
import Studio from "./Studio.js";
import Inst from "./Plugin/Loader/Game/ManhuntGeneric/Inst.js";

export class Save{

    constructor(){
        let _this = this;
        jQuery('[data-save]').click(function () {
            _this.onSave();
        });
    }

    onSave(){
        this.save();
    }

    save(){

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
                    filename: filename,
                    data: entry.binary
                });
            }

        });

        if (files.length > 1){
            console.error("Multi files not supported yet.");
            return;
        }

        let file = files[0];

        const link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link );


        const blob = new Blob( [ file.data ], { type: 'text/plain' } );
        const objectURL = URL.createObjectURL( blob );

        link.href = objectURL;
        link.href = URL.createObjectURL( blob );
        link.download =  file.filename;
        link.click();

    }



}