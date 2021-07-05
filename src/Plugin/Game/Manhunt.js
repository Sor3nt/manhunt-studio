import AbstractManhunt from "./AbstractManhunt.js";

export default class Manhunt extends AbstractManhunt{
    modelNameLengh = 23;

    static handlerName = "Manhunt 1 (PC;1.00)";
    name = "Manhunt 1";

    static canHandle(game, platform, version){
        if(game     !== "mh1") return false;
        if(platform !== "pc")  return false;
        return version === 1.00;
    }

    loadLevel( levelName, callback ){
        let files = [
            'levels/GLOBAL/DATA/ManHunt.pak#./levels/' + levelName + '/entityTypeData.ini',
            'levels/' + levelName + '/allanims.ifp',
            'levels/' + levelName + '/pak/modelspc.txd',
            'levels/' + levelName + '/pak/modelspc.dff',
            'levels/' + levelName + '/entity.inst',
            'levels/' + levelName + '/entity2.inst',
            'levels/' + levelName + '/pak/scene1pc.txd',
            'levels/' + levelName + '/scene1.bsp',
            'levels/GLOBAL/CHARPAK/cash_pc.txd',
            'levels/GLOBAL/CHARPAK/cash_pc.dff',
        ];

        let _this = this;
        this.requestFiles(files, function () {
            _this.processLevel();
            callback();
        });
    }


}