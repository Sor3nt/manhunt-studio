import AbstractGame from "./Abstract.js";
import Storage from "../../Storage.js";
import Studio from "../../Studio.js";
import Entity from "../../Entity.js";
import Result from "../Loader/Result.js";
import MeshHelper from "../../MeshHelper.js";

export default class AbstractManhunt extends AbstractGame{

    /**
     * Called once all level resources are available
     */
    processLevel(){
        this.createEntities();
        //
        // let mapEntries = Storage.findBy({
        //     type: Studio.MAP,
        //     gameId: this.gameId
        // });
        //
        // mapEntries.forEach(function (map) {
        //
        //     // let mesh = MeshHelper.convertFromNormalized( map );
        //     // console.log("map data", mesh);
        // });


    }


    /**
     * Create Game-Entities
     * Each entity represents a object in the 3d world.
     */
    createEntities(){
        let gameId = this.gameId;

        let instEntries = Storage.findBy({
            type: Studio.INST,
            gameId: gameId
        });

        instEntries.forEach(function (inst) {

            let entity = new Entity(gameId, inst);

            Storage.add(new Result(
                Studio.ENTITY,
                entity.name,
                0,
                {
                    className: inst.data().entityClass
                },
                function(){
                    return entity;
                }
            ));

        });
    }

}