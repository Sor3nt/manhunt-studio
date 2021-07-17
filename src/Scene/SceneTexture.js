import {Mesh,MeshStandardMaterial,PerspectiveCamera, HemisphereLight, CubeGeometry} from "../Vendor/three.module.js";
import StudioScene from "./StudioScene.js";
import SceneAbstract from "./Abstract.js";

export default class SceneTexture extends SceneAbstract{


    /**
     * @type {Mesh}
     */
    outputCube = null;

    /**
     *
     * @type {StudioSceneInfo}
     */
    sceneInfo = null;

    constructor(name, canvas) {
        super(name, canvas);

        this.sceneInfo = StudioScene.createSceneInfo(
            canvas,
            this.name,
            new PerspectiveCamera( 35, 1, 1, 100 ),
            null,
            function(){}
        );

        //todo renderOnlyOnce
        this.#setup();
    }

    #setup(){
        this.sceneInfo.camera.position.set(0, 0, -100);
        this.sceneInfo.camera.lookAt(this.sceneInfo.scene.position);

        this.sceneInfo.scene.add(new HemisphereLight(0xffffff, 0xffffff));

        let cubeGeometry = new CubeGeometry( 50, 50, 50 );

        //Note: we need to flip the UVs because DDS are stored bottom to top
        cubeGeometry.faceVertexUvs[0].forEach(function (uv, index) {
            for(let i = 0; i < 3; i++){
                cubeGeometry.faceVertexUvs[0][index][i].y *= -1;
            }
        });
        cubeGeometry.needsUpdate = true;

        this.outputCube = new Mesh( cubeGeometry );
        this.outputCube.visible = false;

        this.sceneInfo.scene.add(this.outputCube);
    }

    /**
     *
     * @param entry {Result}
     */
    display( entry ){

        /**
         * @type {NormalizedTexture}
         */
        let texture = entry.data();

        let mat = new MeshStandardMaterial();
        mat.name = 'displayTexture';
        mat.map = texture.createThreeTexture();
//
//         if (texture.hasAlphaMap()){
//             // mat.alphaMap = texture.createThreeTextureAlphaMap();
//             mat.transparent = true;
//
//             // console.log(mat.alphaMap);
//             mat.map = texture.createThreeTextureAlphaMap();
//         }else{
//             // mat.map = texture.createThreeTexture();
//
//         }
// console.log(mat);
        this.outputCube.material = mat;
        this.outputCube.visible = true;
    }

}