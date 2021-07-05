
export default class Result{

    constructor(type, name, offset, props, getData){

        this.type = type;
        this.name = name;
        this.offset = offset;
        this.props = props;
        this.getData = getData;

        this.cache = null;

        /**
         * Note: file and gameId are written in class "Loader.load" AFTER parsing the file
         * but before adding them into the storage.
         */
        this.file = "";
        this.gameId = null;
    }

    data(){
        if (this.cache === null)
            this.cache = this.getData();

        return this.cache;
    }
}