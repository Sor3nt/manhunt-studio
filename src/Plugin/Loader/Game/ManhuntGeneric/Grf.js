import AbstractLoader from "./../../Abstract.js";
import Result from "../../Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";
import Config from "../../../../Config.js";
import Game from "../../../Game.js";

export default class Grf extends AbstractLoader{
    static name = "Waypoints (Manhunt 1/2)";

    /**
     * @param entry {Result}
     */
    static update(entry){

    }

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        if (binary.remain() <= 0) return false;

        binary.setCurrent(8);

        let isZero = binary.consume(4, 'int32');

        return isZero === 0;
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){
        let game = Games.GAMES.MANHUNT;
        let results = [];

        let count = binary.consume(4, 'int32');

        //GNIA :  Manhunt 2
        if (count === 1095323207){
            game = Games.GAMES.MANHUNT_2;
            binary.seek(4); //const
            count = binary.consume(4, 'int32');
        }


        let area = Grf.parseArea(binary, count, game);

        let waypointRoutes = Grf.parseWaypointRoutes(binary);
        let areaNames = Grf.parseAreaNames(binary);

        let locationById = {};

        area.forEach(function (location) {
            location.area = areaNames[location.groupIndex];
            let result = new Result(
                Studio.AREA_LOCATION,
                location.name,
                "",
                0,
                location,
                function(){
                    return location;
                }
            );

            locationById[location.id] = result;
            results.push(result);
        });


        waypointRoutes.forEach(function (route) {


            route.locations = [];
            route.entries.forEach(function (locationId) {
                route.locations.push(locationById[locationId]);
            });

            results.push(new Result(
                Studio.WAYPOINT_ROUTE,
                route.name,
                "",
                0,
                route,
                function(){
                    return route;
                }
            ));
        });
        return results;
    }

    /**
     *
     * @param binary
     * @returns {string[]}
     */
    static parseAreaNames(binary){
        let count = binary.int32();

        let results = [];
        for(let x = 0; x < count; x++){
            results.push(binary.getString(0, true));
        }

        return results;
    }

    /**
     *
     * @param binary
     * @returns {{order:int, name: string, entries: int[] }[]}
     */
    static parseWaypointRoutes(binary){

        let count = binary.int32();

        let results = [];
        for(let i = 0; i < count; i++){
            results.push({
                'order' :  i,
                'name' :  binary.getString(0, true),
                'entries' :  Grf.parseBlock(binary)
            });
        }

        return results;

    }

    /**
     *
     * @param binary
     * @param entryCount
     * @param game
     * @returns {{name: string, groupIndex: int, position: {x:double,y:double,z:double}, radius: double, nodeName: string, relation: int[], waypoints: mix[]}[]}
     */
    static parseArea(binary, entryCount, game){

        let entries = [];

        for(let i = 0; i < entryCount; i++){

            let entry = {
                id: i,
                name: binary.getString(0, true),
                groupIndex: binary.int32(),
                position: binary.readVector3(),
                radius: binary.float32(),
                nodeName: binary.getString(0, true),
                relation: Grf.parseBlock(binary)
            };

            if (game === Games.GAMES.MANHUNT_2){
                entry.relation2 = Grf.parseBlock(binary);
            }

            entry.waypoints = Grf.parseWayPointBlock(binary);

            if (game === Games.GAMES.MANHUNT_2){
                let zero1 = binary.int32();
                if (zero1 !== 0) console.error("zero is not zero ...");
                let zero2 = binary.int32();
                if (zero2 !== 0) console.error("zero2 is not zero ...");
            }

            entries.push(entry);
        }

        return entries;
    }


    static parseBlock(binary){
        let count = binary.int32();

        let result = [];
        for(let x = 0; x < count; x++){
            result.push(binary.int32());
        }

        return result;
    }

    static parseWayPointBlock(binary){

        let count = binary.int32();

        let result = [];
        for(let x = 0; x < count; x++){

            let linkId1 = binary.int32();
            let type = binary.int32();

            let entry = {
                'linkId' :  linkId1,
                'type' :  type,
                'relation' :  Grf.parseBlock(binary)
            };

            result.push(entry);
        }

        return result;
    }


}