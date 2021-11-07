import Storage from "./Storage.js";
import Studio from "./Studio.js";
import Helper from "./Helper.js";
import Games from "./Plugin/Games.js";
import MeshHelper from "./MeshHelper.js";
import {Group, Euler, Quaternion, Mesh, MeshBasicMaterial, SphereGeometry} from "./Vendor/three.module.js";

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
     * @param entry {Result}
     * @param instResult {Result}
     */
    constructor(entry, instResult){
        this.inst = instResult;
        this.entry = entry;
        this.name = instResult.name;

        //Each Entity (inst) is related to one GLG entry
        this.glgEntry = Storage.findOneBy({
            type: Studio.GLG,
            gameId: entry.gameId,
            level: entry.level,
            name: this.inst.props.glgRecord
        });

        if (this.glgEntry === null)
            return;


        switch (this.glgEntry.props.getValue('CLASS')) {
            case 'EC_TRIGGER':

                const geometry = new SphereGeometry( this.inst.data().settings.radius, 32, 32 );
                const material = new MeshBasicMaterial( {
                    color: 0xffff00,
                    opacity: 0.2,
                    transparent: true
                } );

                this.model = new Group();
                this.mesh = this.model;

                let mesh = new Mesh( geometry, material );
                this.model.add(mesh);

                let instData = this.inst.data();
                this.setPosition(instData.position.x,instData.position.y,instData.position.z);

                break;

            default:

                this.#loadModel();

        }

        // console.log(this.glgEntry.props.getValue('CLASS'));

        //
        // let modelName = this.glgEntry.props.getValue('MODEL');
        // if (modelName === false)
        //     return;
        //
        // this.model = Storage.findOneBy({
        //     type: Studio.MODEL,
        //     gameId: entry.gameId,
        //     level: entry.level,
        //     name: this.glgEntry.props.getValue('MODEL')
        // });



    }

    getMesh(){
        if (this.model === undefined)
            return false;

        if (this.mesh !== undefined)
            return this.mesh;


        if (this.model.name === "fist_poly_hunter")
            return false;

        this.mesh = MeshHelper.convertFromNormalized( this.model.props.normalize(), this.model );

        let head = this.glgEntry.props.getValue('HEAD');
        if (head !== false){

            let headGlg = Storage.findOneBy({
                type: Studio.GLG,
                gameId: this.entry.gameId,
                level: this.entry.level,
                name: head
            });

            if (headGlg === null){
                console.error(`[Entity] Unable to find Head GLG ${head} for Model ${this.model.name}`);

            }else{

                let headModel = Storage.findOneBy({
                    type: Studio.MODEL,
                    gameId: this.entry.gameId,
                    level: this.entry.level,
                    name: headGlg.props.getValue('MODEL')
                });

                if (headModel === null){
                    console.error(`[Entity] Unable to find Head Model ${headGlg.props.getValue('MODEL')} for Model ${this.model.name}`);
                }else{
                    let headMesh = MeshHelper.convertFromNormalized( headModel.props.normalize(), headModel );

                    this.mesh.children[0].skeleton.bones.forEach(function (bone) {
                        if (bone.name === "Bip01_Head") bone.add(headMesh); //mh2
                        if (bone.name === "Bip01 Head") bone.add(headMesh); //mh1
                    });

                }
            }

        }

        if (this.mesh === false){
            console.error("Unable to parse Mesh for Model", this.model.name, this.model);
            return false;
        }

        let instData = this.inst.data();
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

        if (this.glgEntry === null)
            return;

        //Load the model if required
        let modelName = this.glgEntry.props.getValue("MODEL");
        if (modelName === false) return;

        if (modelName === "fist_poly_hunter"){
            //TODO mh2
            // if (Studio.config.getGame(this.gameId).game === "mh2"){
            //     modelName = 'danny_asylum_bloody';
            // }else{
                modelName = 'Player_Bod';
            // }
        }

        let game = Games.getGame(this.entry.gameId);

        let models = game.findBy({
            type: Studio.MODEL,
            level: this.entry.level,
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
