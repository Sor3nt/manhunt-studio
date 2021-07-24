
import Renderware from "./../Plugin/Loader/Renderware/Renderware.js";
import Helper from './../Helper.js'
import AbstractNormalize from "./Abstract.js";
import Status from "../Status.js";
const assert = Helper.assert;


export default class NormalizeMap extends AbstractNormalize{

    constructor( data ){
        super(data);

        this.#normalize();
    }



    #getMaterialList( ) {
        let chunkMaterialList = Renderware.findChunk(this.data, Renderware.CHUNK_MATLIST);
        let chunksMaterial = Renderware.findChunks(chunkMaterialList, Renderware.CHUNK_MATERIAL);

        let materials = [];
        chunksMaterial.forEach(function (material) {

            let _material = {
                diffuse: material.result.rgba,
                textureName: null,
                opacitymap: null,
            };

            let chunkTexture = Renderware.findChunk(material, Renderware.CHUNK_TEXTURE);
            if (chunkTexture !== false){
                assert(chunkTexture.type, Renderware.CHUNK_TEXTURE);
                let chunksString = Renderware.findChunks(chunkTexture, Renderware.CHUNK_STRING);

                _material.textureName = chunksString[0].result.name;
                if (chunksString[0].result.name)
                    _material.opacitymap = chunksString[1].result.name;
            }


            materials.push(_material.textureName);

        });

        return materials;
    }

    #getGeometryValues( _chunk ) {

        let _this = this;
        let result = [];
        _chunk.result.chunks.forEach(function (chunk) {
            if (chunk.type === Renderware.CHUNK_PLANESECT){
                let _val = _this.#getGeometryValues(chunk);
                _val.forEach(function (val) {
                    if (typeof val.vertex !== "undefined")
                        result.push(val);
                });
            } else if (typeof chunk.result.vertex !== "undefined" && chunk.result.vertex.length > 0) {
                result.push(chunk.result);
            }

        });

        return result;
    }

    #normalize(){
        let meshes = [];
        // Status.set(`Normalize Map Material`);
        let materialList = this.#getMaterialList();
        // Status.set(`Normalize Map Geometry`);
        let geometryValues = this.#getGeometryValues(this.data);

        // Status.set(`Normalize Map (convert)`);
        geometryValues.forEach(function (geometryValue) {

            meshes.push({
                skinning: false,
                faces: geometryValue.faces,
                vertices: geometryValue.vertex,
                faceVertexUvs: [geometryValue.uvForFaces],
            });

        });

        this.result = {
            material: materialList,
            objects: meshes,
        };
    }



}