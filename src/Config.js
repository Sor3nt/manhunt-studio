import Api from "./Api.js";
import Game from "./Plugin/Game.js";

export default class Config{

    constructor( onLoadCallback ){
        let _this = this;
        this.config = { games: [] };

        // Api.getConfig(function (config) {
        //     console.log('[MANHUNT.config] Config received', config.data);
        //
        //     config.data.games.forEach(function (gameInfo) {
        //         _this.config.games.push(Game.create(gameInfo));
        //     });

            onLoadCallback(_this.config);
        // });
    }

    addGame (folder, callback) {
        let _this = this;
        console.log('[MANHUNT.config] Add folder ', folder);
        Api.addGame(folder, function (result) {
            if (result.status === false) return callback(result);

            console.log('[MANHUNT.config] Add game ', result);
            _this.config.games.push(result);
            callback(result);
        });
    }

    /**
     *
     * @param id {int}
     * @returns {AbstractGame}
     */
    getGame (id) {
        return this.config.games[id];
    }

    getGames () {
        return this.config.games;
    }

}

//
// MANHUNT.config = (function () {
//
//     var self = {
//         config: false,
//
//         _onLoadCallback : false,
//
//         _init: function () {
//             Api.getConfig(function (config) {
//                 console.log('[MANHUNT.config] Config received', config.data);
//                 self.config = config.data;
//                 if (self._onLoadCallback !== false){
//                     self._onLoadCallback();
//                     self._onLoadCallback = false;
//                 }
//             });
//         },
//
//         onLoadCallback: function (callback) {
//             if (self.config !== false) return callback();
//             self._onLoadCallback = callback;
//         },
//
//         addGame: function (folder, callback) {
//             console.log('[MANHUNT.config] Add folder ', folder);
//             Api.addGame(folder, function (result) {
//                 if (result.status === false) return callback(result);
//
//                 console.log('[MANHUNT.config] Add game ', result);
//                 self.config.games.push(result);
//                 callback(result);
//             });
//         },
//
//         getGame: function (id) {
//             return self.config.games[id];
//         },
//
//         getGames: function () {
//             return self.config.games;
//         }
//     };
//
//     self._init();
//
//     return {
//         getGame: self.getGame,
//         getGames: self.getGames,
//         addGame: self.addGame,
//         onLoadCallback: self.onLoadCallback
//     }
// })();