import AbstractBuilder from "./../../Abstract.js";
import Result from "../../../Loader/Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";


export default class Grf extends AbstractBuilder{
    static name = "Waypoints (Manhunt 1/2)";

    /**
     * @param game {Game}
     * @returns {Result[]}
     */
    static build(game){

        let areaLocations = game.findBy({
            type: Studio.AREA_LOCATION
        });

        let binary = new NBinary();
        let rememberOffset = {
            count: 0
        };

        if (game.game === Games.GAMES.MANHUNT) {

            rememberOffset.count = binary.current();
            binary.setInt32(0);

        }else if (game.game === Games.GAMES.MANHUNT_2){
            binary.setInt32(1095323207); //GNIA
            binary.setInt32(1); //const

            rememberOffset.count = binary.current();
            binary.setInt32(0); //count
        }


        let area = Grf.createAreas(binary, count, game);






        let waypointRoutes = Grf.parseWaypointRoutes(binary);
        let areaNames = Grf.createAreasNames(binary);

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
    static createAreasNames(binary){
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
    static createAreas(binary, entryCount, game){

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