import NBinary from "./NBinary.js";
import Event from "./Event.js";
import Status from "./Status.js";
import Loader from "./Plugin/Loader.js";
import Storage from "./Storage.js";
import Studio from "./Studio.js";

export default class FileDrop{

    /**
     *
     * @type {{name: string, binary: NBinary}[]}
     */
    files = [];

    /**
     *
     * @type {Result[]}
     */
    entries = [];
    openRequests = 0;

    loadedMap = {
        model: false,
        modelTexture: false,
        map: false,
        mapTexture: false,
        instances1: false,
        instances2: false,
        glg: false,
    };


    constructor(id){
        let _this = this;
        //
        // let dropFolder = document.getElementById('dropFolder');
        // dropFolder.addEventListener("change", function (e) {
        //     let files = e.target.files;
        //
        //     for (var i = 0, len = files.length; i < len; i++) {
        //         let file = files[i];
        //
        //         console.log(file);
        //     }
        // }, false);
        //
        this.wizzardContainer = jQuery('#import');

        this.wizzardContainer.find('[data-fied="level"]').change(function () {

            let level = _this.wizzardContainer.find('[data-fied="level"]').val();
            if (level !== "none"){
                let entries = Storage.findBy({
                    level: level
                });

                if (entries.length !== 0){
                    // _this.reset();
                    _this.updateMapByStorage();
                }
            }


            _this.updateWizzard();
        });

        this.wizzardContainer.find('[data-import]').click(function () {
            let status = _this.updateWizzard();
            if (status){
                _this.finish();
            }
        });


        let dropZone = document.getElementById(id);

        dropZone.addEventListener('dragover', function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        dropZone.addEventListener('drop', function (e) {
            _this.onDrop(e);
        });
    }

    onDrop(e){
        this.wizzardContainer.show();
        Status.hideWelcome();

        let files = e.dataTransfer.files;

        this.openRequests = files.length;
        for(let i in files){
            if (!files.hasOwnProperty(i)) continue;
            this.processFile(files[i]);
        }

        // Prevent default behavior (Prevent file from being opened)
        e.preventDefault();
    }

    /**
     *
     * @param file {Blob}
     */
    processFile(file){
        let _this = this;
        let reader = new FileReader();

        /**
         *
         * @param event {Event}
         */
        reader.onload = function(event) {

            let binary = new NBinary(event.target.result);
            _this.files.push({
                name: file.name,
                binary: binary
            });
            _this.openRequests--;

            if (_this.openRequests === 0){
                _this.allFilesLoaded();
            }
        };

        reader.readAsArrayBuffer(file);

    }

    allFilesLoaded(){
        let _this = this;
        this.files.forEach(function (file) {
            Event.dispatch(Event.DROP_FILE, file);

            let parsed = Loader.parse(file.binary, {});



            // _this.wizzardContainer.find('[data-id="file-list"]').append(jQuery());


            parsed.forEach(function (entry) {

                if(entry.file === "")
                    entry.file = file.name;

                if(entry.fileName === "")
                    entry.fileName = file.name.split('.')[0];

                switch (entry.type) {
                    case Studio.MODEL:
                        _this.loadedMap.model = true;
                        break;
                    case Studio.MAP:
                        _this.loadedMap.map = true;
                        break;
                    case Studio.TEXTURE:
                        if (file.name.indexOf('scene') !== -1 ){
                            _this.loadedMap.mapTexture = true;

                        }else if (file.name.indexOf('models') !== -1){
                            _this.loadedMap.modelTexture = true;
                        }

                        break;
                    case Studio.INST:
                        if (file.name.indexOf('entity2') !== -1 ){
                            _this.loadedMap.instances2 = true;
                        }else{
                            _this.loadedMap.instances1 = true;
                        }
                        break;
                    case Studio.GLG:
                        _this.loadedMap.glg = true;
                        break;

                }

                _this.entries.push(entry);
            });
        });

        this.files = [];
        this.updateWizzard();
    }

    updateMapByStorage() {
        let level = this.wizzardContainer.find('[data-fied="level"]').val();
        if (level === "none") return;

        let entries = Storage.findBy({
            level: level
        });

        let _this = this;

        entries.forEach(function (entry) {
           switch (entry.type) {
               case Studio.MODEL:
                   _this.loadedMap.model = true;
                   break;
               case Studio.MAP:
                   _this.loadedMap.map = true;
                   break;
               case Studio.TEXTURE:
                   if (entry.fileName.indexOf('scene') !== -1 ){
                       _this.loadedMap.mapTexture = true;

                   }else if (entry.fileName.indexOf('models') !== -1){
                       _this.loadedMap.modelTexture = true;
                   }

                   break;
               case Studio.INST:
                   if (entry.fileName.indexOf('entity2') !== -1 ){
                       _this.loadedMap.instances2 = true;
                   }else{
                       _this.loadedMap.instances1 = true;
                   }
                   break;
               case Studio.GLG:
                   _this.loadedMap.glg = true;
                   break;
           }
        });

    }



    updateWizzard(){


        for(let name in this.loadedMap){
            if (!this.loadedMap.hasOwnProperty(name))
                continue;

            if (this.loadedMap[name] === true)
                this.wizzardContainer.find(`[data-file-id="${name}"]`)
                    .html("OK")
                    .removeClass('badge-danger')
                    .addClass('badge-success');
            else
                this.wizzardContainer.find(`[data-file-id="${name}"]`)
                    .html("x")
                    .removeClass('badge-success')
                    .addClass('badge-danger');

        }

        let enableButton = false;

        let level = this.wizzardContainer.find('[data-fied="level"]').val();

        if (level !== "none"){
            if (this.loadedMap.modelTexture && this.loadedMap.model){
                enableButton = true;
            }else if (this.loadedMap.mapTexture && this.loadedMap.map){
                enableButton = true;
            }else if (this.loadedMap.glg){
                enableButton = true;
            }
        }


        if (enableButton){
            this.wizzardContainer.find('[data-import]')
                .prop('disabled', false)
                .removeClass('btn-danger')
                .addClass('btn-success')
            ;
        }else{
            this.wizzardContainer.find('[data-import]')
                .prop('disabled', true)
                .removeClass('btn-success')
                .addClass('btn-danger')
            ;
        }

        return enableButton;
    }

    reset(){
        this.loadedMap = {
            model: false,
            modelTexture: false,
            map: false,
            mapTexture: false,
            instances1: false,
            instances2: false,
            glg: false,
        };

        this.entries = [];
        this.updateWizzard();
    }

    finish(){

        let level = this.wizzardContainer.find('[data-fied="level"]').val();

        this.entries.forEach(function (entry) {
            entry.level = level;

            Storage.add(entry);

            Event.dispatch(Event.ENTRY_LOADED, {
                entry: entry
            });

        });


        this.wizzardContainer.find('[data-fied="level"]').val('none');
        this.wizzardContainer.hide();
        this.reset();
    }
}