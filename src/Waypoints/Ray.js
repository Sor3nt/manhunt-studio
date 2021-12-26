import {Raycaster, Vector3} from "../Vendor/three.module.js";

export default class Ray{

    /**
     *
     * @type {Mesh[]}
     */
    meshes = [];

    /**
     *
     * @param meshes {Mesh[]}
     */
    constructor(meshes){
        this.meshes = meshes;

    }

    /**
     *
     * @param vec3 {Vector3}
     * @returns {{left: (boolean|double), back: (boolean|double), right: (boolean|double), front: (boolean|double)}}
     */
    getDistanceToMesh(vec3){

        let col1 = (new Raycaster( vec3.clone(), new Vector3(0,0, 1) )).intersectObjects( this.meshes );
        let col2 = (new Raycaster( vec3.clone(), new Vector3(0,0, -1) )).intersectObjects( this.meshes );
        let col3 = (new Raycaster( vec3.clone(), new Vector3(1,0, 0) )).intersectObjects( this.meshes );
        let col4 = (new Raycaster( vec3.clone(), new Vector3(-1,0, 0) )).intersectObjects( this.meshes );
        let col5 = (new Raycaster( vec3.clone(), new Vector3(0,-1, 0) )).intersectObjects( this.meshes );

        return {
            right: col1.length === 0 ? false : col1[0].distance,
            left: col2.length === 0 ? false : col2[0].distance,
            front: col3.length === 0 ? false : col3[0].distance,
            back: col4.length === 0 ? false : col4[0].distance,
            bottom: col5.length === 0 ? false : col5[0].distance
        };
    }
}
