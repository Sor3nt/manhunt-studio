import Storage from "./Storage.js";
import Studio from "./Studio.js";
import Helper from "./Helper.js";
import MeshHelper from "./MeshHelper.js";
import {Euler, Quaternion} from "./Vendor/three.module.js";
import NormalizeModel from "./Plugin/Loader/Renderware/Utils/NormalizeModel.js";

export default class Entity{
    /**
     * @type {Result}
     */
    model;

    /**
     * @type {Group|boolean}
     */
    mesh;

    /**
     *
     * @param gameId {int}
     * @param instResult {Result}
     */
    constructor(gameId, instResult){

        this.inst = instResult;
        this.gameId = gameId;
        this.name = instResult.name;

        //Each Entity (inst) is related to one GLG entry
        this.glgEntry = Storage.findOneBy({
            type: Studio.GLG,
            gameId: this.gameId,
            name: this.inst.props.glgRecord
        });

        let modelName = this.glgEntry.props.getValue('MODEL');
        if (modelName === false)
            return;

        this.model = Storage.findOneBy({
            type: Studio.MODEL,
            gameId: this.gameId,
            name: this.glgEntry.props.getValue('MODEL')
        });

        this.#loadModel();


    }

    getMesh(){
        if (this.model === undefined)
            return false;

        if (this.mesh !== undefined)
            return this.mesh;


        // console.log(this.model);
        this.mesh = MeshHelper.convertFromNormalized( new NormalizeModel(this.model.data()), this.model.gameId );

        let instData = this.inst.getData();
        this.setPosition(instData.position.x,instData.position.y,instData.position.z);
        this.setRotation(instData.rotation.x,instData.rotation.y,instData.rotation.z,instData.rotation.w);

        return this.mesh;
    }


    setPosition(x,y,z) {
        this.mesh.position.set(x, y, z)
    }

    setRotation(x, y, z, w) {
        let quaternion = new Quaternion(x, z, -y, w * -1);

        let v = new Euler();
        v.setFromQuaternion(quaternion);

        this.mesh.rotation.copy(v);
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
