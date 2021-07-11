import Storage from "./Storage.js";
import Studio from "./Studio.js";
import Helper from "./Helper.js";
import MeshHelper from "./MeshHelper.js";

export default class Entity{

    /**
     *
     * @param gameId {int}
     * @param instResult {Result}
     */
    constructor(gameId, instResult){

        this.inst = instResult;
        this.gameId = gameId;
        this.name = instResult.name;
        this.mesh = null;

        /**
         * @type {Result}
         */
        this.model;


        //Each Entity (inst) is related to one GLG entry
        this.glgEntry = Storage.findOneBy({
            type: Studio.GLG,
            gameId: this.gameId,
            name: this.inst.props.glgRecord
        });

        Helper.assert(this.glgEntry !== null);
        this.#loadModel();

    }

    getMesh(){
        // if (this.mesh !== null)
        //     return this.mesh;

        this.mesh = MeshHelper.convertFromNormalized( this.model );
        return this.mesh;
    }

    #loadModel(){

        //Load the model if required
        let modelName = this.glgEntry.props.getValue("MODEL");
        if (modelName === false) return;

        if (modelName === "fist_poly_hunter"){
            if (Studio.config.getGame(this.gameId).game === "mh2"){
                modelName = 'danny_asylum_bloody';
            }else{
                modelName = 'Player_Bod';
            }
        }

        let models = Storage.findBy({
            type: Studio.MODEL,
            gameId: this.gameId,
            name: modelName
        });

        if (models.length === 0){
            console.error("Model could not be found", modelName);
            return;
        }

        if (models.length > 1)
            console.warn("There are multiple models for the same name", modelName, models);

        this.model = models[0];


    }

}
