
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
        this.getData = getData;

        this.cache = null;

        /**
         * Note: file and gameId are written in class "Loader.load" AFTER parsing the file
         * but before adding them into the storage.
         */
        this.file = "";
        this.fileName = "";
        this.level = "";
        this.gameId = -1;
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