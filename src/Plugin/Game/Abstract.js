import Loader from "../Loader.js";

export default class AbstractGame{

    static handlerName = "? (?;?)";
    name = "Unnamed Game";
    modelNameLengh = 128;

    static canHandle(){
        console.log("Not implemented");
        debugger;
        return false;
    }

    constructor(gameId, game, platform, version, path){
        this.openFileRequest = 0;

        this.name = "";
        this.gameId = gameId;
        this.game = game;
        this.platform = platform;
        this.version = version;
        this.path = path;
    }

    /**
     * @param levelName {string}
     * @param callback {function}
     */
    loadLevel(levelName, callback){
        console.log("Not implemented");
        debugger;
    }

    /**
     * @param files {[]}
     * @param callback {function}
     */
    requestFiles(files, callback){

        let _this = this;
        this.openFileRequest = files.length;
        files.forEach(function (file) {
            Loader.load(
                _this.gameId,
                file,
                {
                    gameId: _this.gameId
                },
                function () {
                    _this.openFileRequest--;

                    if (_this.openFileRequest === 0)
                        callback()
                }
            )
        });
    }


}