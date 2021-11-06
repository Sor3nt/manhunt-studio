
export default class Result{

    /**  @type {string} */
    file = "";

    /**  @type {string} */
    fileName = "";

    /**  @type {string} */
    level = "unk";

    /**  @type {string} */
    filePath = "";

    gameFourCC = null;
    platformFourCC = null;


    gameId = null;
    cache = null;
    hasChanges = false;
    changes = {};

    /**
     *
     * @param type {int}
     * @param name {string}
     * @param binary {ArrayBuffer}
     * @param offset {int}
     * @param props {{}}
     * @param getData {function}
     */
    constructor(type, name, binary, offset, props, getData){

        this.type = type;
        this.name = name;
        this.binary = binary;
        this.offset = offset;
        this.props = props;

        let _this = this;
        this.getData = function () {
            return getData(offset, _this.props);
        };
    }

    setFilePath(path){
        //in some cases the function is called twice, ignore it
        if (this.level !== '' && this.filePath !== '' && this.file !== '' && this.fileName !== '' )
            return;

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