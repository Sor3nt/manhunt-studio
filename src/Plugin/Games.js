
export default class Games{

    static GAMES = {
        MANHUNT:            'mh1',
        MANHUNT_2:          'mh2',
    };


    static PLATFORM = {
        PLAYSTATION_1:      'psx',
        PLAYSTATION_2:      'ps2',
        PLAYSTATION_psp:    'psp',
        WII:                'wii',
        XBOX:               'xbox',
        PC:                 'pc'
    };

    /**
     * @type {Game[]}
     */
    static games = [];

    static createGameId(){
        return Games.games.length;
    }

    /**
     * @param game {Game}
     */
    static addGame(game){
        console.debug("[Games] Add Game", game);
        Games.games.push(game);
    }

    /**
     * @param id {int}
     * @returns {Game}
     */
    static getGame(id){
        return Games.games[id];
    }
}
