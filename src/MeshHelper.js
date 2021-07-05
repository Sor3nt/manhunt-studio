import {Group, Geometry, BufferGeometry, Mesh, MeshBasicMaterial, SkinnedMesh, Vector3, VertexColors} from "./Vendor/three.module.js";
import Studio from "./Studio.js";
import Storage from "./Storage.js";

export default class MeshHelper{

    static generateMaterial(gameId, material, skinning){
        if (typeof material === "undefined" || material.length === 0) return [];
        if (skinning === undefined)
            debugger;


        let result = [];

        material.forEach(function (name) {

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
            result.push(new MeshBasicMaterial({
                // wireframe: true,
                map: texture[0].data().createThreeTexture(), //todo: actual we need to select the correct txd (model.dff use his model.txd)
                skinning: skinning,
                transparent: false, //todo
                vertexColors: VertexColors
            }));
        });

        return result;
    }

    /**
     *
     * @param result {Result}
     * @returns {Group}
     */
    static convertFromNormalized(result){

        let generic = result.data();

        let group = new Group();
        group.userData.LODIndex = 0;
        group.name = result.name;

        let objects = generic.getObjects();
        let material = [];

        if (generic.getMaterial() !== false)
            material = MeshHelper.generateMaterial(result.gameId, generic.getMaterial(), objects[0].skinning);


        objects.forEach(function (entry, index) {


            if (typeof entry.material !== "undefined")
                material = MeshHelper.generateMaterial(result.gameId, entry.material, entry.skinning);


            let geometry = new Geometry();

            geometry.faceVertexUvs = entry.faceVertexUvs;
            geometry.faces = entry.faces;


            if (typeof entry.meshBone !== "undefined"){
                entry.vertices.forEach(function (vertex) {
                    let vec = new Vector3( vertex.x, vertex.y, vertex.z );

                    //move matrix apply to parsing....
                    // if (level.getPlatform() === "pc")
                    vec = vec.applyMatrix4(entry.meshBone.matrixWorld);

                    geometry.vertices.push(vec);
                });
            }else{
                geometry.vertices = entry.vertices;
            }

            if (typeof entry.skinIndices === "object")
                geometry.skinIndices = entry.skinIndices;

            if (typeof entry.skinWeights === "object")
                geometry.skinWeights = entry.skinWeights;

            let bufferGeometry = new BufferGeometry();
            bufferGeometry.fromGeometry( geometry );

            let mesh = entry.skinning === true ?
                new SkinnedMesh(bufferGeometry, material) :
                new Mesh(bufferGeometry, material)
            ;

            //only the first LOD is visible (does not apply to player or map)
            // mesh.visible = index === 0;

            let _skeleton = generic.getSkeleton();
            if (index === 0 && entry.skinning === true && _skeleton !== false){
                let skeleton = _skeleton.clone();
                mesh.add(skeleton.bones[0]);
                mesh.bind(skeleton);
            }

            group.add(mesh);
        });

        return group;
    }

}