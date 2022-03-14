import Games from './Games.js';
import Storage from "../Storage.js";
import Studio from "../Studio.js";

export default class Game{

    /**
     * Used for the Storage search, Manhunt 1 as example can only handle 23 chars
     * @type {number}
     */
    modelNameLengh = 128;

    /**
     * @enum {Games.GAMES}
     */
    game;

    /**
     *
     * @param gameFourCC {Games.GAMES}
     * @param platformFourCC {string}
     * @param version {double}
     */
    constructor(gameFourCC, platformFourCC, version){
        this.gameId = Games.createGameId();

        this.game = gameFourCC;             // mh1, mh2
        this.platform = platformFourCC;     // pc, ps2, psp, xbox
        this.version = version;             // 0.1, 1.0, 1.3

        this.name = `${this.game} ${this.platform} (${this.version})`;

        switch (this.game) {
            case Games.GAMES.MANHUNT:
                this.modelNameLengh = 23;
        }
    }

    /**
     *
     * @param criteria
     * @returns {Array<Result>}
     */
    findBy( criteria ){
        criteria.gameId = this.gameId;

        if(criteria.type !== undefined && criteria.name !== undefined && criteria.type === Studio.MODEL)
            criteria.name = criteria.name.substr(0, this.modelNameLengh);

        return Storage.findBy(criteria);

    }

    findOneBy( criteria ){
        criteria.gameId = this.gameId;

        if(criteria.type !== undefined && criteria.name !== undefined && criteria.type === Studio.MODEL)
            criteria.name = criteria.name.substr(0, this.modelNameLengh);

        return Storage.findOneBy(criteria);

    }

    /**
     *
     * @param result {Result}
     */
    addToStorage(result){
        result.gameId = this.gameId;
        Storage.add(result);
        console.log("added to storage", result);
    }

    /**
     *
     * @param result {Result}
     */
    removeFromStorage(result){
        result.gameId = this.gameId;
        Storage.remove(result);
    }

}
