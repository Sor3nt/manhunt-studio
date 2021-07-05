
import Renderware from "./../Plugin/Loader/Renderware/Renderware.js";
import Helper from './../Helper.js'
const assert = Helper.assert;


export default class AbstractNormalize{

    constructor( data ){
        this.data = data;
        this.result = {};
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

    #normalize(){}

}