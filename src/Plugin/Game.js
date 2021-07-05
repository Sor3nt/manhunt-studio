import Manhunt from './Game/Manhunt.js';
import AbstractGame from './Game/Abstract.js';

export default class Game{

    /**
     *
     * @type plugins {Array.<AbstractGame>|{[]}}
     */
    static plugins = [];

    /**
     * @param gameInfo
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
    }

    static registerGame( game ){
        console.info("Register Game: ", game.handlerName);
        Game.plugins.push(game);
    }
}