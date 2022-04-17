import Mouse from "../Mouse.js";
import Result from "../Plugin/Loader/Result.js";
import Game from "../Plugin/Game.js";
import Games from "../Plugin/Games.js";
import SceneMap from "../Scene/SceneMap.js";
import Entity from "../Entity.js";
import Studio from "../Studio.js";
import {Raycaster, Vector2, Group} from "../Vendor/three.module.js";
import Renderware from "../Plugin/Loader/Renderware/Renderware.js";
import NormalizeModel from "../Plugin/Loader/Renderware/Utils/NormalizeModel.js";
import Glg from "../Plugin/Loader/Game/ManhuntGeneric/Glg.js";
import Helper from "../Helper.js";
import TextureNative from "../Plugin/Loader/Renderware/Chunk/TextureNative.js";
import {NormalizedTexture} from "../Normalize/texture.js";

export default class Insert{


    /**
     *
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;

    /**
     *
     * @type {Group}
     */
    mesh = null;


    /**
     *
     * @type {Raycaster}
     */
    raycaster = new Raycaster();

    pointer = new Vector2(0, 0);


    binding = {
        mouseClick: null,
        mouseMove: null,
        keyUpEsc: null
    };

    /**
     *
     * @type {Result|null}
     */
    entityToCopy = null;


    /**
     *
     * @type {Result|null}
     */
    glg = null;

    /**
     *
     * @type {Result|null}
     */
    targetInst = null;

    /**
     *
     * @type {Result|null}
     */
    modelTexsCol = null;


    /**
     *
     * @type {function|null}
     */
    onPlaceCallback = null;



    /**
     *
     * @type {Game|null}
     */
    sourceGame = null;


    /**
     *
     * @type {Game|null}
     */
    targetGame = null;


    /**
     *
     * @type {String}
     */
    sourceLevel = "";


    /**
     *
     * @type {String}
     */
    targetLevel = "";


    /**
     *
     * @param props {{sceneInfo: StudioSceneInfo,  onPlaceCallback: function, entityToCopy: Result, sourceGame: Game, targetGame: Game, sourceLevel: string}}
     */
    constructor(props){
        this.sceneInfo = props.sceneInfo;
        this.onPlaceCallback = props.onPlaceCallback;
        this.entityToCopy = props.entityToCopy;
        this.sourceGame = props.sourceGame;
        this.targetGame = props.targetGame;
        this.sourceLevel = props.sourceLevel;
console.log("source", this.sourceGame);
console.log("target", this.targetGame);
        this.sceneInfo.scene.add(this.getMesh());

        this.binding.mouseClick = this.onMouseClick.bind(this);
        this.binding.mouseMove = this.onMouseMove.bind(this);
        this.binding.keyUpEsc = this.onKeyUpEsc.bind(this);

        Mouse.onMouseMove(this.binding.mouseMove);

        /**
         * We need to delay the registration a little bit
         * Otherwise we receive the Click-Event from the Menu-Interaction
         */
        let _this = this;
        setTimeout(function () {
            document.addEventListener('pointerlockchange', _this.binding.keyUpEsc, false);
            Mouse.onMouseClick(_this.binding.mouseClick);
        }, 500);

    }

    unbind(){
        Mouse.removeOnMouseClick(this.binding.mouseClick);
        Mouse.removeOnMouseMove(this.binding.mouseMove);
        document.removeEventListener('pointerlockchange', this.binding.keyUpEsc);
    }

    onKeyUpEsc(){
        this.unbind();
        this.sceneInfo.scene.remove(this.getMesh());
        this.onPlaceCallback(null);
    }

    onMouseClick(){
        this.unbind();

        /**
         *
         * @type {Walk}
         */
        let control = this.sceneInfo.control;
        control.setObject(this.mesh);
        control.setMode('transform');

        this.onPlaceCallback(this.mesh);
    }

    onMouseMove(){
        this.raycaster.setFromCamera( this.pointer, this.sceneInfo.camera );

        const intersects = this.raycaster.intersectObjects( this.sceneInfo.scene.children[1].children );

        if ( intersects.length > 0 ) {

            // let nodeMesh = this.mesh;

            this.mesh.position.set( 0, 0, 0 );
            // this.mesh.lookAt( intersects[ 0 ].face.normal );

            this.mesh.position.copy( intersects[ 0 ].point );
            this.mesh.position.y += 0.5;
        }
    }


    /**
     *
     * @returns {Group}
     */
    getMesh(){
        if (this.mesh !== null)
            return this.mesh;

        if (this.sceneInfo.studioScene instanceof SceneMap) {
            this.targetLevel = this.sceneInfo.studioScene.mapEntry.level;

            this.glg = this.getTargetGlg();
            this.modelTexsCol = this.getTargetModelAndTextures();

            this.targetInst = this.getTargetInstance();

            let entity = this.createEntity();
            this.targetGame.addToStorage(entity);

            //create relation back
            this.targetInst.entity = entity;


            let mesh = entity.data().getMesh();

            mesh.name = entity.name;
            mesh.userData.entity = entity;
            entity.mesh = mesh;

            this.mesh = mesh;
            return this.mesh;


        }else{
            console.error("not inside scenee ?!");
        }



    }

    createEntity(){

        let entity = new Entity(this.sceneInfo.studioScene.mapEntry, this.targetInst);
        let result = new Result(
            Studio.ENTITY,
            this.targetInst.name,
            new ArrayBuffer(0),
            0,
            {
                className: this.targetInst.data().entityClass
            },
            function(){
                return entity;
            }
        );
        result.level = this.sceneInfo.studioScene.mapEntry.level;
        result.gameId = this.targetGame.gameId;

        result.props.instance = entity.inst;
        result.props.glgEntry = entity.glgEntry;

        return result;

    }

    getTargetGlg(){
        let sourceInstData = this.entityToCopy.props.instance.data();

        let targetGlg = this.targetGame.findOneBy({
            type: Studio.GLG,
            level: this.targetLevel,
            name: sourceInstData.glgRecord
        });

        if (targetGlg === null){
            console.log(`[Insert] Copy GLG/INI Record ${sourceInstData.glgRecord} to level ${this.targetLevel}.`);

            let sourceGlg = this.sourceGame.findOneBy({
                type: Studio.GLG,
                level: this.sourceLevel,
                name: sourceInstData.glgRecord
            });


            let glgNBinary = sourceGlg.props.getRawChunk();

            targetGlg = Glg.createResult(sourceGlg.name, glgNBinary, sourceGlg.data(), false);
            targetGlg.level = this.targetLevel;
            targetGlg.gameId = this.targetGame.gameId;
            targetGlg.file = sourceGlg.file;
            targetGlg.fileName = sourceGlg.fileName;

            this.targetGame.addToStorage(targetGlg);
        }

        return targetGlg;
    }


    getTargetModelCollision(){

        let colName = this.glg.props.getValue("COLLISION_DATA");

        let targetCol = this.targetGame.findOneBy({
            type: Studio.COLLISION,
            level: this.targetLevel,
            name: colName
        });

        if (targetCol !== null)
            return targetCol;

        console.log(`[Insert] Copy Collision ${colName} to level ${this.targetLevel}.`);

        let sourceCol = this.sourceGame.findOneBy({
            type: Studio.COLLISION,
            level: this.sourceLevel,
            name: colName
        });

        console.log(sourceCol);
        console.log(this.sourceGame.findBy({
            type: Studio.COLLISION,
        }));


        let colNBinary = sourceCol.props.getRawChunk();

        targetCol = new Result(
            Studio.COLLISION,
            colName,
            colNBinary.data,
            0,
            {

                /**
                 * @return {NBinary}
                 */
                getRawChunk: function () {
                    colNBinary.setCurrent( 0  );
                    return colNBinary;
                }
            },
            function(){
                alert("Not implemented fully !!");
                debugger;
            }
        );

        targetCol.level = this.targetLevel;
        targetCol.gameId = this.targetGame.gameId;
        targetCol.file = sourceCol.file;
        targetCol.fileName = sourceCol.fileName;

        this.targetGame.addToStorage(targetCol);

        return targetCol;
    }

    getTargetModelTextures( model ){

        let _this = this;


        /*
         * Get Textures from Model
         */
        let normalizedModel = model.props.normalize();
        let objects = normalizedModel.getObjects();

        /** @type {Result[]} */
        let materialToCopy = [];
        objects.forEach(function (object) {
            object.material.forEach(function (name) {
                let targetTexture = _this.targetGame.findOneBy({
                    type: Studio.TEXTURE,
                    name: name,
                    level: _this.targetLevel
                });

                if (targetTexture === null){
                    let sourceTexture = _this.sourceGame.findOneBy({
                        type: Studio.TEXTURE,
                        name: name,
                        level: _this.sourceLevel
                    });

                    if (materialToCopy.indexOf(sourceTexture) === -1)
                        materialToCopy.push(sourceTexture);
                }

            });
        });



        let targetMaterials = [];
        materialToCopy.forEach(function (material) {
            let textureNbinary = material.props.getRawChunk();

            let targetMaterial = new Result(
                Studio.TEXTURE,
                material.name,
                textureNbinary.data,
                0,
                {

                    /**
                     * @return {NBinary}
                     */
                    getRawChunk: function () {
                        textureNbinary.setCurrent(0);
                        return textureNbinary;
                    }
                },
                function(){
                    textureNbinary.setCurrent(0);

                    let chunk = Renderware.parseHeader(textureNbinary);
                    Helper.assert(chunk.id, Renderware.CHUNK_TEXTURENATIVE);

                    let texNative = new TextureNative(textureNbinary, chunk, {});
                    texNative.parse();

                    return new NormalizedTexture(
                        texNative.texture.mipmaps,
                        null,
                        texNative.texture.bitPerPixel,
                        texNative.platform,
                        texNative.texture.format,
                        false
                    );

                }
            );


            targetMaterial.level = _this.targetLevel;
            if (_this.targetGame.game === Games.GAMES.MANHUNT){
                targetMaterial.file = 'modelspc.txd';
            }else{
                targetMaterial.file = 'modelspc.tex';
            }
            targetMaterial.fileName = 'modelspc';

            console.log(`[Insert] Copy Texture ${material.name} to level ${_this.targetLevel}.`);

            _this.targetGame.addToStorage(targetMaterial);

            targetMaterials.push(targetMaterial);

        });

        return targetMaterials;
    }

    getTargetModelAndTextures(){
        let isSameGame = this.sourceGame.game === this.targetGame.game;


        let modelName = this.glg.props.getValue("MODEL");

        let targetModel = this.targetGame.findOneBy({
            type: Studio.MODEL,
            level: this.targetLevel,
            name: modelName
        });


        let sourceModel = this.sourceGame.findOneBy({
            type: Studio.MODEL,
            level: this.sourceLevel,
            name: modelName
        });

        let results = [];
        if (targetModel === null){
            console.log(`[Insert] Copy Model ${modelName} to level ${this.targetLevel}.`);



            if (isSameGame === true){

                let modelNBinary = sourceModel.props.getRawChunk();

                let targetModel;


                targetModel = new Result(
                    Studio.MODEL,
                    modelName,
                    modelNBinary.data,
                    0,
                    {
                        normalize: function () {
                            modelNBinary.setCurrent(0);
                            let tree = Renderware.parse(modelNBinary, false);
                            return new NormalizeModel(tree.rootData);
                        },

                        /**
                         * @return {NBinary}
                         */
                        getRawChunk: function () {
                            modelNBinary.setCurrent(0);
                            return modelNBinary;
                        }
                    },
                    function(){
                        modelNBinary.setCurrent(0);
                        let tree = Renderware.parse(modelNBinary, false);
                        return tree.rootData;
                    }
                );


                targetModel.level = this.targetLevel;
                targetModel.file = sourceModel.file;
                targetModel.fileName = sourceModel.fileName;

                this.targetGame.addToStorage(targetModel);

                results.push(targetModel);
            }else{
                console.error("Copy not supported for model ", sourceModel);
            }
        }


        results.push(this.getTargetModelCollision());
        let targetTextures = this.getTargetModelTextures(sourceModel);
        targetTextures.forEach(function (targetTexture) {
            results.push(targetTexture);
        });

        return results;
    }

    getTargetInstance(){
        let sourceInstData = this.entityToCopy.props.instance.data();
        let targetInstData = { ...sourceInstData};

        let isSameGame = this.sourceGame.game === this.targetGame.game;

        let targetFileName = "";

        if (
            this.sourceGame.game === Games.GAMES.MANHUNT &&
            this.targetGame.game === Games.GAMES.MANHUNT_2
        )
            targetFileName = "entity_pc.inst";
        else if (
            this.sourceGame.game === Games.GAMES.MANHUNT_2 &&
            this.targetGame.game === Games.GAMES.MANHUNT
        )
            targetFileName = "entity.inst";
        else if (
            this.sourceGame.game === Games.GAMES.MANHUNT &&
            this.targetGame.game === Games.GAMES.MANHUNT
        )
            targetFileName = "entity.inst";
        else if (
            this.sourceGame.game === Games.GAMES.MANHUNT_2 &&
            this.targetGame.game === Games.GAMES.MANHUNT_2
        )
            targetFileName = "entity_pc.inst";



        //Search a free name
        let searchFreeSlot = true;
        let i = -1;
        while(searchFreeSlot){
            let checkTargetInst = this.targetGame.findOneBy({
                type: Studio.INST,
                level: this.targetLevel,
                file: targetFileName,
                name: sourceInstData.name + (i === -1 ? "" :  "_" + i)
            });

            searchFreeSlot = checkTargetInst !== null;
            if(!searchFreeSlot) break;

            i++;
        }

        targetInstData.name += i === -1 ? "" : "_" + i;

        let result = new Result(
            Studio.INST,
            targetInstData.name,
            new ArrayBuffer(0),
            0,
            {
                glgRecord: targetInstData.glgRecord,
            },
            function(){
                return targetInstData;
            }
        );

        result.level = this.targetLevel;
        result.fileName = targetFileName.split(".")[0];
        result.file = targetFileName;

        console.log(`[Insert] Create Instance ${targetInstData.name} in level ${this.targetLevel}.`, result);
        this.targetGame.addToStorage(result);

        return result;
    }



}
