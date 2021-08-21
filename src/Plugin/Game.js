import Manhunt from './Game/Manhunt.js';
import Manhunt2 from './Game/Manhunt2.js';
import AbstractGame from './Game/Abstract.js';

export default class Game{

    /**
     *
     * @type plugins {Array.<AbstractGame>|{[]}}
     */
    static plugins = [];

    /**
     * @param gameInfo { { game: string, platform: string, version: string, id: int, path: string}  }
     * @returns {AbstractGame|null}
     */
    static create(gameInfo){
        let game = null;
        Game.plugins.forEach(function (Handler) {
            if (Handler.canHandle(gameInfo.game, gameInfo.platform, gameInfo.version)){
                game = new Handler(gameInfo.id, gameInfo.game, gameInfo.platform, gameInfo.version, gameInfo.path);
                console.log("New Game Handler created", game, game.name);
            }
        });

        if (game === null)
            console.error("No Game handler found for", gameInfo);

        return game;
    }

    static registerGames(){
        this.registerGame(Manhunt);
        this.registerGame(Manhunt2);
    }

    static registerGame( game ){
        console.info("Register Game: ", game.handlerName);
        Game.plugins.push(game);
    }
}