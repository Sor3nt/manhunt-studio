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

    display( texture ){
        // self._resize(texture.image.width, texture.image.height);
console.log("try to show texture", texture);
        let mat = new MeshStandardMaterial();
        mat.name = 'displayTexture';
        // mat.color.setRGB(0,0,0);
        mat.map = texture;
        // mat.transparent = texture.format === THREE.RGBA_S3TC_DXT5_Format;

        this.outputCube.material = mat;
        this.outputCube.visible = true;
    }

}