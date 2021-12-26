import Result from './Plugin/Loader/Result.js'
import Studio from "./Studio.js";
export default class Storage{

    /**
     * @type {Array.<Result>} storage
     */
    static storage = [];
    static byTypeGameName = {};
    static count = 0;

    /**
     * @param result {Result}
     */
    static add(result){

        Storage.count++;

        let index = `S_${result.type}_${result.level}_${result.gameId}_${result.name}`;
        if (Storage.byTypeGameName[ index ] === undefined)
            Storage.byTypeGameName[ index ] = [];

        Storage.byTypeGameName[ index ].push(result);
        Storage.storage.push(result);
    }

    /**
     * @param result {Result}
     */
    static remove(result){

        Storage.count--;

        let index = `S_${result.type}_${result.level}_${result.gameId}_${result.name}`;
        delete Storage.byTypeGameName[ index ];

        Storage.storage.splice( Storage.storage.indexOf(result), 1);
    }

    /**
     * @param criteria {{}}
     * @returns {Result}
     */
    static findOneBy( criteria ){
        let results = Storage.findBy(criteria);
        if (results.length > 1){
            console.error("We found more then one result!");
            debugger;
        }

        if (results.length === 0)
            return null;
        return results[0];
    }

    /**
     *
     * @param criteria
     * @returns {Array.<Result>}
     */
    static findBy( criteria ){

        if (
            (criteria.type !== undefined && criteria.gameId !== undefined && criteria.name !== undefined && criteria.level !== undefined) &&
            (criteria.offset === undefined && criteria.file === undefined && criteria.props === undefined)){

            let entries = Storage.byTypeGameName[ `S_${criteria.type}_${criteria.level}_${criteria.gameId}_${criteria.name}` ];
            if (entries === undefined)
                return [];
            return entries;
        }

        console.warn("Slow Storage search is used for query", criteria);

        let result = [];
        Storage.storage.forEach(function ( entry ) {

            if (criteria.hasChanges !== undefined && entry.hasChanges   !== criteria.hasChanges)   return;
            if (criteria.level   !== undefined && entry.level   !== criteria.level)   return;
            if (criteria.type   !== undefined && entry.type   !== criteria.type)   return;
            if (criteria.name   !== undefined && entry.name   !== criteria.name)   return;
            if (criteria.offset !== undefined && entry.offset !== criteria.offset) return;
            if (criteria.gameId !== undefined && entry.gameId !== criteria.gameId) return;
            if (criteria.file   !== undefined && entry.file   !== criteria.file)   return;


            if (criteria.props !== undefined){
                if (entry.props === undefined)
                    return;

                for(var i in criteria.props){
                    if (!criteria.props.hasOwnProperty(i))
                        continue;

                    if (entry.props[i] === undefined || entry.props[i] !== criteria.props[i])
                        return;
                }
            }

            result.push(entry);
        });

        return result;
    }
}
