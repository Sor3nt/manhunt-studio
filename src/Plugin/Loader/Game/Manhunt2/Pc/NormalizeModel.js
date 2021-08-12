
import {Bone, Face3, Matrix4, Skeleton, Vector2, Vector3, Vector4} from "./../../../../../Vendor/three.module.js";



export default class NormalizeModel{

    constructor( data ){
        this.data = data;
        this.result = {};


        this.allBones = [];
        this.allBonesMesh = [];
        this.#normalize();
    }

    #normalize(){

        let result = {
            skeleton: false,

            bones: [],
            objects: []
        };

        result.skeleton = this.data.skeleton;

        this.data.objects.forEach(function (mesh) {
            result.objects.push(mesh);
        });


        this.result = result;
    }


    #get(field){
        if (this.result[field] === undefined)
            return false;

        return this.result[field];
    }

    getMaterial(){
        return this.#get('material');
    }

    getObjects(){
        return this.#get('objects');
    }

    getSkeleton(){
        return this.#get('skeleton');
    }

    getBones(){
        return this.#get('bones');
    }

}