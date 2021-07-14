
export default class Model{
    /** @type {string[]} */
    material = [];

    /** @type {boolean} */
    skinning = false;

    /** @type {Bone} */
    meshBone = null;



    /** @type {Vector3[]} */
    vertices = [];

    /** @type {Vector4[]} */
    skinWeights = [];

    /** @type {Vector4[]} */
    skinIndices = [];



    /** @type {Face3} */
    faces = [];

    /** @type {[[Vector2, Vector2, Vector2][]]} */
    faceVertexUvs = [];


}