import AbstractManhunt from "./AbstractManhunt.js";

export default class Manhunt2 extends AbstractManhunt{
    modelNameLengh = 32;

    static handlerName = "Manhunt 2 (PC;1.00)";
    name = "Manhunt 2";

    static canHandle(game, platform, version){
        if(game     !== "mh2") return false;
        if(platform !== "pc")  return false;
        return version === 1.00;
    }

    loadLevel( levelName, callback ){
        let files = [
            'levels/' + levelName + '/modelspc.mdl',
            'levels/' + levelName + '/modelspc.tex',
            'levels/' + levelName + '/scene1_pc.bsp',
            'levels/' + levelName + '/scene1_pc.tex',
            'levels/' + levelName + '/entity_pc.inst',
            'levels/' + levelName + '/resource3.glg',
            // 'levels/GLOBAL/CHARPAK/cash_pc.txd',
            // 'levels/GLOBAL/CHARPAK/cash_pc.dff',
        ];

        let _this = this;
        this.requestFiles(files, function () {
            _this.processLevel();
            callback();
        });
    }


}