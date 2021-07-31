
export default class Result{

    /**
     * @type {string}
     */
    file;

    hasChanges = false;
    changes = {};

    constructor(type, name, binary, offset, props, getData){

        this.props = {};
        this.type = type;
        this.name = name;
        this.binary = binary;
        this.offset = offset;
        this.props = props;
        this.getData = function () {
            return getData(offset, this.props);
        };

        this.cache = null;

        /**
         * Note: file and gameId are written in class "Loader.load" AFTER parsing the file
         * but before adding them into the storage.
         */
        this.filePath = "";
        this.file = "";
        this.fileName = "";
        this.level = "";
        this.gameId = -1;
    }

    setFilePath(path){
        path = path.replace("\\", "/"); //normalize

        let parts = path.split("/");
        let file = parts[parts.length - 1];

        let levelName = "";
        parts.forEach(function (part, index) {
            if (part.toLowerCase() === "levels")
                levelName = parts[index + 1].toLowerCase();
        });

        this.level = levelName;
        this.filePath = path;
        this.file = file;
        this.fileName = file.split(".")[0];

    }

    setData( props ){
        this.changes = Object.assign(this.changes, props);
        this.hasChanges = true;
    }

    data(){
        if (this.cache === null)
            this.cache = this.getData();

        return this.cache;
    }
}