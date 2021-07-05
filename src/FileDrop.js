import NBinary from "./NBinary.js";
import Event from "./Event.js";

export default class FileDrop{

    /**
     *
     * @type {{file: File, binary: NBinary}[]}
     */
    files = [];
    openRequests = 0;

    constructor(id){
        let _this = this;

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
        this.files.forEach(function (file) {
            Event.dispatch(Event.DROP_FILE, file);
        });

        this.files = [];
    }

}