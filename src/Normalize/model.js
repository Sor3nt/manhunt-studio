import {BufferGeometry, Mesh, SkinnedMesh, Vector3, Geometry, Group, MeshBasicMaterial, VertexColors} from "../Vendor/three.module.js";
import Status from "../Status.js";
import Storage from "../Storage.js";
import Studio from "../Studio.js";

export default class Model{
    /** @type {string[]} */
    material = [];

    /** @type {boolean} */
    skinning = false;

    /** @type {Bone|null} */
    meshBone = null;

    /** @type {Skeleton|null} */
    skeleton = null;


    /** @type {Vector3[]} */
    vertices = [];

    /** @type {Vector4[]} */
    skinWeights = [];

    /** @type {Vector4[]} */
    skinIndices = [];



    /** @type {Face3[]} */
    faces = [];

    /** @type {[[Vector2, Vector2, Vector2][]]} */
    faceVertexUvs = [];

    generateMaterial(gameId){
        if (this.material.length === 0) return [];

        let _this = this;
        let result = [];
        this.material.forEach(function (name) {

            if (typeof name === "undefined" || name === null){
                result.push(new MeshBasicMaterial({
                    transparent: false, //todo
                    vertexColors: VertexColors
                }));
                return;
            }

            let texture = Storage.findBy({
                type: Studio.TEXTURE,
                gameId: gameId,
                name: name
            });

            if (texture.length === 0){
                result.push(new MeshBasicMaterial({
                    wireframe: true,
                    vertexColors: VertexColors
                }));
                return;
            }

            result.push(new MeshBasicMaterial({
                // wireframe: true,
                map: texture[0].data().createThreeTexture(), //todo: actual we need to select the correct txd (model.dff use his model.txd)
                skinning: _this.skinning,
                transparent: false, //todo
                vertexColors: VertexColors
            }));
        });

        return result;
    }


    /**
     *
TODO!!!
     */
    //note: old MeshHelper.convertFromNormalized moved to this file
    get(gameId){

        let geometry = new Geometry();
        geometry.faceVertexUvs = this.faceVertexUvs;
        geometry.faces = this.faces;
        geometry.skinIndices = this.skinIndices;
        geometry.skinWeights = this.skinWeights;

        if (this.meshBone !== null){
            this.vertices.forEach(function (vertex) {
                let vec = new Vector3( vertex.x, vertex.y, vertex.z );

                //move matrix apply to parsing....
                // if (level.getPlatform() === "pc")
                vec = vec.applyMatrix4(entry.meshBone.matrixWorld);

                geometry.vertices.push(vec);
            });
        }else{
            geometry.vertices = entry.vertices;
        }

        let bufferGeometry = new BufferGeometry();
        bufferGeometry.fromGeometry( geometry );

        let material = this.generateMaterial(gameId);
        let mesh = this.skinning === true ?
            new SkinnedMesh(bufferGeometry, material) :
            new Mesh(bufferGeometry, material)
        ;

        if (this.skinning === true && this.skeleton !== null){
            let skeleton = this.skeleton.clone();
            mesh.add(skeleton.bones[0]);
            mesh.bind(skeleton);
        }

        return mesh;
    }
}