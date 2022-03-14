import AbstractBuilder from "./../../Abstract.js";
import Result from "../../../Loader/Result.js";
import NBinary from "../../../../NBinary.js";
import Studio from "../../../../Studio.js";
import Games from "../../../../Plugin/Games.js";


export default class Grf extends AbstractBuilder{
    static name = "Waypoints (Manhunt 1/2)";

    /**
     * @param game {Game}
     * @param level {string}
     * @returns {NBinary}
     */
    static build(game, level){

        let areaLocations = game.findBy({
            level: level,
            type: Studio.AREA_LOCATION
        });

        let waypointRoutes = game.findBy({
            level: level,
            type: Studio.WAYPOINT_ROUTE
        });

        Grf.reorder(areaLocations, waypointRoutes);
console.log("REORDER", areaLocations, waypointRoutes);

        let binary = new NBinary(new ArrayBuffer(1024 * 1024));

        if (game.game === Games.GAMES.MANHUNT_2){
            binary.setInt32(1095323207); //GNIA
            binary.setInt32(1); //const
        }

        binary.setInt32(areaLocations.length);

        Grf.createAreas(binary, areaLocations, game);
        Grf.createWaypointRoutes(binary, waypointRoutes);
        Grf.createAreasNames(binary, areaLocations);

        binary.end();

        return binary;
    }

    /**
     *
     * @param areaLocations {Result[]}
     * @param waypointRoutes {Result[]}
     */
    static reorder(areaLocations, waypointRoutes) {

        function getLocationById(id){
            let result = false;
            areaLocations.forEach(function (areaLocation) {
                if (areaLocation.props.id === id)
                    result = areaLocation;
            });

            return result;
        }

        //flag anything to reorder
        areaLocations.forEach(function (areaLocation) {
            areaLocation.props.id = areaLocation.props.id + '_reorder';
            areaLocation.props.waypoints.forEach(function (waypoint) {
                waypoint.linkId = waypoint.linkId + '_reorder';

            });
        });


        let currentId = 0;
        areaLocations.forEach(function (areaLocation) {

            let oldId = areaLocation.props.id;
            areaLocation.props.id = currentId;

            //update all related nodes
            areaLocation.props.waypoints.forEach(function (waypoint) {

                let relLocation = getLocationById(waypoint.linkId);
                if (relLocation === false){
                    console.error('Location could not be found');
                    return;
                }

                relLocation.props.waypoints.forEach(function (relWaypoint) {
                    if (relWaypoint.linkId === oldId )
                        relWaypoint.linkId = currentId;
                });

            });

            waypointRoutes.forEach(function (route) {
                let newIds = [];
                route.props.entries.forEach(function (nodeId) {
                    if (nodeId === oldId)
                        newIds.push(currentId);
                    else
                        newIds.push(nodeId);
                });
                route.props.entries = newIds;
            });

            currentId++;
        });
    }

    /**
     *
     * @param binary
     * @param areaLocations {Result[]}
     */
    static createAreasNames(binary, areaLocations){
        let groupIndex = [];
        areaLocations.forEach(function (areaLocation) {
            if (groupIndex.indexOf(areaLocation.props.areaName) !== -1)
                return;

            groupIndex.push(areaLocation.props.areaName);
        });

        binary.setInt32(groupIndex.length);
        groupIndex.forEach(function (name) {
            binary.writeString(name, 0, true, 0x70);
        });
    }

    /**
     *
     * @param binary {NBinary}
     * @param waypointRoutes {Result[]}
     * @returns {{order:int, name: string, entries: int[] }[]}
     */
    static createWaypointRoutes(binary, waypointRoutes){

        binary.setInt32(waypointRoutes.length);

        waypointRoutes.forEach(function (route) {
            binary.writeString(route.name, 0, true, 0x70);

            binary.setInt32(route.props.entries.length);
            route.props.entries.forEach(function (nodeId) {
                binary.setInt32(nodeId);
            });

        });
    }

    /**
     *
     * @param binary {NBinary}
     * @param areaLocations {Result[]}
     * @param game {Game}
     * @returns {{name: string, groupIndex: int, position: {x:double,y:double,z:double}, radius: double, nodeName: string, relation: int[], waypoints: mix[]}[]}
     */
    static createAreas(binary, areaLocations, game){

        let groupIndex = [];
        areaLocations.forEach(function (areaLocation) {
            if (groupIndex.indexOf(areaLocation.props.areaName) !== -1)
                return;

            groupIndex.push(areaLocation.props.areaName);
        });


        areaLocations.forEach(function (areaLocation) {
            let mesh = areaLocation.mesh;
            binary.writeString(areaLocation.props.name, 0x0, true, 0x70);

            binary.setInt32(groupIndex.indexOf(areaLocation.props.areaName));
            binary.setFloat32(mesh.position.x);
            binary.setFloat32(mesh.position.z * -1);
            binary.setFloat32(mesh.position.y);
            binary.setFloat32(areaLocation.props.radius);
            binary.writeString(areaLocation.props.nodeName, 0x0, true, 0x70);

            //unkFlags
            binary.setInt32(areaLocation.props.unkFlags.length);
            areaLocation.props.unkFlags.forEach(function (flag) {
                binary.setInt32(flag);
            });

            //unkFlags2
            if (game.game === Games.GAMES.MANHUNT_2){
                if (areaLocation.props.unkFlags2 === undefined)
                    areaLocation.props.unkFlags2 = [];

                binary.setInt32(areaLocation.props.unkFlags2.length);
                areaLocation.props.unkFlags2.forEach(function (flag) {
                    binary.setInt32(flag);
                });
            }

            binary.setInt32(areaLocation.props.waypoints.length);
            areaLocation.props.waypoints.forEach(function (waypoint) {
                binary.setInt32(waypoint.linkId);
                binary.setInt32(waypoint.type);

                binary.setInt32(waypoint.relation.length);
                waypoint.relation.forEach(function (flag) {
                    binary.setInt32(flag);
                });
            });

            if (game.game === Games.GAMES.MANHUNT_2){
                binary.setInt32(0);
                binary.setInt32(0);
            }
        });

    }



}
