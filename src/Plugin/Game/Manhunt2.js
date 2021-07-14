import AbstractManhunt from "./AbstractManhunt.js";

export default class Manhunt2 extends AbstractManhunt{
    modelNameLengh = 23;

    static handlerName = "Manhunt 2 (PC;1.00)";
    name = "Manhunt 2";

    static canHandle(game, platform, version){
        if(game     !== "mh2") return false;
        if(platform !== "pc")  return false;
        return version === 1.00;
    }

    loadLevel( levelName, callback ){
        let files = [
            // 'ps2_TEX.TXD',
            'levels/A01_Escape_Asylum/modelspc.mdl',
            // 'psp_MODELS.TXD',
            // 'levels/' + levelName + '/modelspc.tex',
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