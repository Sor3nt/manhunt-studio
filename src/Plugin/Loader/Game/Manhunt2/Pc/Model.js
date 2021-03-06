import AbstractLoader from "./../../../Abstract.js";
import Result from "./../../../Result.js";
import { VertexColors, Face3, Color, Vector2, Vector3, Vector4, Bone, Matrix4, Skeleton, MeshStandardMaterial } from "./../../../../../Vendor/three.module.js";
import NBinary from "../../../../../NBinary.js";
import Studio from "../../../../../Studio.js";
import NormalizeModel from "./NormalizeModel.js";
import Scan from "../../../Renderware/Utils/Scan.js";

export default class Model extends AbstractLoader{
    static name = "Model (Manhunt 2 PC)";

    static allBones = [];
    static meshBone = {};
    static normals = [];

    /**
     * @param binary {NBinary}
     * @returns {boolean}
     */
    static canHandle(binary){
        //PMLC
        return AbstractLoader.checkFourCC(binary,1129074000);
    }

    /**
     * @param binary {NBinary}
     * @param options {{}}
     * @returns {Result[]}
     */
    static list(binary, options){

        binary.setCurrent(32);

        let firstEntryIndexOffset = binary.consume(4, 'int32');
        binary.setCurrent(firstEntryIndexOffset);

        let results = [];
        let nextEntryIndexOffset = 0x20;

        do{

            nextEntryIndexOffset = binary.consume(4, 'int32');
            binary.seek(4);

            let entryOffset = binary.consume(4, 'int32'); //ReadClump
            binary.setCurrent(entryOffset);

            let rootBoneOffset = binary.consume(4, 'int32'); //parseEntry

            //get Skin flag
            // binary.seek(16);
            // let firstObjectInfoOffset = binary.consume(4, 'int32');
            // binary.setCurrent(firstObjectInfoOffset + 12);
            // let objectOffset = binary.consume(4, 'int32');
            // binary.setCurrent(objectOffset + 144);
            // let VertexElementType = binary.consume(4, 'int32');
            // let skinDataFlag = ((VertexElementType >> 8) & 0x10) === 0x10;

            //get Model name
            binary.setCurrent(rootBoneOffset + 24);
            let name = Model.readName(binary);

            (function (offset, name) {
                results.push(new Result(
                    Studio.MODEL,
                    name,
                    binary,
                    offset,
                    {
                        normalize: function () {
                            binary.setCurrent(offset);

                            let data = Model.readClump(binary);
                            if (data === false){
                                //
                                // binary.setCurrent(0);
                                // let scanner = new Scan(binary);
                                // console.log("Scan", this);

                                return false;
                            }

                            data.name = name;
                            //
                            return new NormalizeModel(data);
                        }
                    },
                    function(){
                        binary.setCurrent(offset);

                        let data = Model.readClump(binary);
                        data.name = name;
                        return data;
                    }
                ));
            })(entryOffset, name);

            if (nextEntryIndexOffset !== 0x20)
                binary.setCurrent(nextEntryIndexOffset);

        }while(nextEntryIndexOffset !== 0x20);


        return results;
    }


    static parseBoneTransDataIndex(binary, boneTransDataIndexOffset ){

        binary.setCurrent(boneTransDataIndexOffset);

        let data = {
            'numBone': binary.consume(4, 'int32'),
            'BoneTransDataOffset': binary.consume(4, 'int32'),
            'matrix': []
        };

        binary.setCurrent(data.BoneTransDataOffset);

        for (let i = 0; i < data.numBone ; i++){
            data.matrix.push(
                binary.consume(4 * 16, 'arraybuffer')
            )
        }

        return data;
    }

    static parseMaterial(binary, numMaterials ){
        let materials = [];

        for(let i = 0; i < numMaterials; i++){

            let material = {
                'TexNameOffset': binary.consume(4, 'int32'),
                // 'Loaded': binary.consume(1, 'uint8'),

                'Color_RGBA': [
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8'),
                ],
                'Color_RGBA2': [
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8'),
                    binary.consume(1, 'uint8')
                ]
            };

            let nextMaterialOffset = binary.current();

            binary.setCurrent(material.TexNameOffset);
            material.TexName = binary.getString(0, true);
            materials.push(material);

            binary.setCurrent(nextMaterialOffset);
        }

        return materials;
    }

    static parseObject(binary ){

        //180 byte block
        let data = {
            'MaterialOffset': binary.consume(4, 'int32'),
            'NumMaterials': binary.consume(4, 'int32'),
            'BoneTransDataIndexOffset': binary.consume(4, 'int32'),
            'unknown': binary.consume(4, 'arraybuffer'),
            'unknown2': binary.consume(4, 'arraybuffer'),
            'Position': (function (binary) {
                return [
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32')
                ];
            })(binary),
            'modelChunkFlag': binary.consume(4, 'int32'),
            'modelChunkSize': binary.consume(4, 'int32'),
            'zero': binary.consume(4, 'int32'),
            'numMaterialIDs': binary.consume(4, 'int32'),
            'numFaceIndex': binary.consume(4, 'int32'),
            'boundingSphereXYZ': (function (binary) {
                return [
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32')
                ];
            })(binary),
            'boundingSphereRadius': binary.consume(4, 'float32'),
            'boundingSphereScale': (function (binary) {
                return [
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32'),
                    binary.consume(4, 'float32')
                ];
            })(binary),
            'numVertex': binary.consume(4, 'int32'),
            'zero2': binary.consume(12, 'arraybuffer'),
            'PerVertexElementSize': binary.consume(4, 'int32'),
            'unknown4': binary.consume(4 * 11, 'arraybuffer'),
            'VertexElementType': binary.consume(4, 'int32'), // 180 byte block - 32 byte
            'unknown5': binary.consume(4 * 8, 'arraybuffer'),

            'faceindex': [],
            'vertex': [],
            'normals': []
        };

        //44 byte * data.numMaterialIDs
        data.mtlIds = Model.parseMaterialIDs(binary, data.numMaterialIDs );

        //2 byte * data.numFaceIndex
        for(let i = 0; i < data.numFaceIndex ; i++){
            data.faceindex.push(
                binary.consume(2, 'int16')
            )
        }

        data.VertexElementType2 = data.VertexElementType >> 8;
        data.skinDataFlag = (data.VertexElementType2 & 0x10) === 0x10;
        data.numUV = data.VertexElementType2 & 0xf;

        data.CPV_array = [];
        data.UV1_array = [];
        data.UV2_array = [];

        let vertex;
        if (data.VertexElementType === 0x52) {
            for(let i = 0; i < data.numVertex ; i++) {
                vertex = {
                    'x': binary.consume(4, 'float32'),
                    'y': binary.consume(4, 'float32'),
                    'z': binary.consume(4, 'float32'),
                    'normal': Model.parseNormal(binary),
                    'Color_B': binary.consume(1, 'uint8') / 255.0,
                    'Color_G': binary.consume(1, 'uint8') / 255.0,
                    'Color_R': binary.consume(1, 'uint8') / 255.0,
                    'Color_A': binary.consume(1, 'uint8') / 255.0,

                    'maxWeight': 0

                };

                data.CPV_array.push(new Color( vertex.Color_R, vertex.Color_G, vertex.Color_B ));

                data.vertex.push(vertex);
                data.normals.push(new Vector3(vertex.normal.x, vertex.normal.y, vertex.normal.z));
            }

        }else if (data.VertexElementType === 0x152){
            for(let i = 0; i < data.numVertex ; i++) {
                vertex = {
                    'x': binary.consume(4, 'float32'),
                    'y': binary.consume(4, 'float32'),
                    'z': binary.consume(4, 'float32'),
                    'normal': Model.parseNormal(binary),
                    'Color_B': binary.consume(1, 'uint8') / 255.0,
                    'Color_G': binary.consume(1, 'uint8') / 255.0,
                    'Color_R': binary.consume(1, 'uint8') / 255.0,
                    'Color_A': binary.consume(1, 'uint8') / 255.0,
                    'tu': binary.consume(4, 'float32'),
                    'tv': binary.consume(4, 'float32'),

                    'maxWeight': 0
                };

                data.CPV_array.push(new Color( vertex.Color_R, vertex.Color_G, vertex.Color_B ));
                data.UV1_array.push([vertex.tu, vertex.tv, 0]);

                data.vertex.push(vertex);
                data.normals.push(new Vector3(vertex.normal.x, vertex.normal.y, vertex.normal.z));
            }

        }else if (data.VertexElementType === 0x252){
            for(let i = 0; i < data.numVertex ; i++) {

                vertex = {
                    'x': binary.consume(4, 'float32'),
                    'y': binary.consume(4, 'float32'),
                    'z': binary.consume(4, 'float32'),
                    'normal': Model.parseNormal(binary),
                    'Color_B': binary.consume(1, 'uint8') / 255.0,
                    'Color_G': binary.consume(1, 'uint8') / 255.0,
                    'Color_R': binary.consume(1, 'uint8') / 255.0,
                    'Color_A': binary.consume(1, 'uint8') / 255.0,
                    'tu': binary.consume(4, 'float32'),
                    'tv': binary.consume(4, 'float32'),
                    'tu2': binary.consume(4, 'float32'),
                    'tv2': binary.consume(4, 'float32'),

                    'maxWeight': 0
                };

                data.CPV_array.push(new Color( vertex.Color_R, vertex.Color_G, vertex.Color_B ));
                data.UV1_array.push([vertex.tu, vertex.tv, 0]);
                data.UV2_array.push([vertex.tu2, vertex.tv2, 0]);
                data.vertex.push(vertex);
                data.normals.push(new Vector3(vertex.normal.x, vertex.normal.y, vertex.normal.z));
            }

        }else if (data.VertexElementType === 0x115E){
            for(let i = 0; i < data.numVertex ; i++){

                vertex = {
                    'x': binary.consume(4, 'float32'),
                    'y': binary.consume(4, 'float32'),
                    'z': binary.consume(4, 'float32'),
                    'weight4': binary.consume(4, 'float32'),
                    'weight3': binary.consume(4, 'float32'),
                    'weight2': binary.consume(4, 'float32'),
                    'weight1': binary.consume(4, 'float32'),
                    'boneID4': binary.consume(1, 'uint8'),
                    'boneID3': binary.consume(1, 'uint8'),
                    'boneID2': binary.consume(1, 'uint8'),
                    'boneID1': binary.consume(1, 'uint8'),
                    'normal': Model.parseNormal(binary),
                    'Color_B': binary.consume(1, 'uint8') / 255.0,
                    'Color_G': binary.consume(1, 'uint8') / 255.0,
                    'Color_R': binary.consume(1, 'uint8') / 255.0,
                    'Color_A': binary.consume(1, 'uint8') / 255.0,
                    'tu': binary.consume(4, 'float32'),
                    'tv': binary.consume(4, 'float32')
                };

                vertex.maxWeight = vertex.weight1 +
                    vertex.weight2 +
                    vertex.weight3 +
                    vertex.weight4;

                data.CPV_array.push(new Color( vertex.Color_R, vertex.Color_G, vertex.Color_B ));
                data.UV1_array.push([vertex.tu, vertex.tv, 0]);

                data.vertex.push(vertex);
                data.normals.push(new Vector3(vertex.normal.x, vertex.normal.y, vertex.normal.z));
            }

        }else if (data.VertexElementType === 0x125E){

            for(let i = 0; i < data.numVertex ; i++){
                vertex = {
                    'x': binary.consume(4, 'float32'),
                    'y': binary.consume(4, 'float32'),
                    'z': binary.consume(4, 'float32'),
                    'weight4': binary.consume(4, 'float32'),
                    'weight3': binary.consume(4, 'float32'),
                    'weight2': binary.consume(4, 'float32'),
                    'weight1': binary.consume(4, 'float32'),
                    'boneID4': binary.consume(1, 'uint8'),
                    'boneID3': binary.consume(1, 'uint8'),
                    'boneID2': binary.consume(1, 'uint8'),
                    'boneID1': binary.consume(1, 'uint8'),
                    'normal': Model.parseNormal(binary),
                    'Color_B': binary.consume(1, 'uint8') / 255.0,
                    'Color_G': binary.consume(1, 'uint8') / 255.0,
                    'Color_R': binary.consume(1, 'uint8') / 255.0,
                    'Color_A': binary.consume(1, 'uint8') / 255.0,
                    'tu': binary.consume(4, 'float32'),
                    'tv': binary.consume(4, 'float32'),
                    'tu2': binary.consume(4, 'float32'),
                    'tv2': binary.consume(4, 'float32'),
                };


                vertex.maxWeight = vertex.weight1 +
                    vertex.weight2 +
                    vertex.weight3 +
                    vertex.weight4;

                data.CPV_array.push(new Color( vertex.Color_R, vertex.Color_G, vertex.Color_B ));
                data.UV1_array.push([vertex.tu, vertex.tv, 0]);
                data.UV2_array.push([vertex.tu2, vertex.tv2, 0]);
                data.vertex.push(vertex);

                data.normals.push(new Vector3(vertex.normal.x, vertex.normal.y, vertex.normal.z));
            }
        }

        return data;
    }


    static parseNormal(binary ){
        return {
            'x': binary.consume(2, 'int16') / 32768.0,
            'y': (binary.consume(2, 'int16') / 32768.0) ,
            'z': binary.consume(2, 'int16') / 32768.0,
            'pad': binary.consume(2, 'int16'),
        };

    }

    static parseMaterialIDs(binary, numMaterialIDs ){
        let materials = [];

        for(let i = 0; i < numMaterialIDs; i++){

            //44 byte block
            materials.push({
                'BoundingBoxMinX': binary.consume(4, 'float32'),
                'BoundingBoxMinY': binary.consume(4, 'float32'),
                'BoundingBoxMinZ': binary.consume(4, 'float32'),
                'BoundingBoxMaxX': binary.consume(4, 'float32'),
                'BoundingBoxMaxY': binary.consume(4, 'float32'),
                'BoundingBoxMaxZ': binary.consume(4, 'float32'),
                'MaterialIDNumFace': binary.consume(2, 'int16'),
                'MaterialID': binary.consume(2, 'int16'),
                'StartFaceID': binary.consume(2, 'int16')
            });

            binary.seek(14);

        }

        return materials;

    }


    static parseObjectInfo(binary ){

        let info = {
            'nextObjectInfoOffset': binary.consume(4, 'int32'),
            'prevObjectInfoOffset': binary.consume(4, 'int32'),
            'objectParentBoneOffset': binary.consume(4, 'int32'),
            'objectOffset': binary.consume(4, 'int32'),
            'rootEntryOffset': binary.consume(4, 'int32'),
        };

        binary.seek(12);

        return info;

    }

    static parseBone(binary ){

        let myBoneOffset = binary.current();
        binary.seek(4);

        let nextBrotherBoneOffset = binary.consume(4, 'int32');

        let parentBoneOffset = binary.consume(4, 'int32');
        let rootBoneOffset = binary.consume(4, 'int32');
        let subBoneOffset = binary.consume(4, 'int32');

        let animationDataIndexOffset = binary.consume(4, 'int32');

        let boneName = binary.consume(40, 'arraybuffer');
        boneName = new NBinary(boneName);
        boneName = boneName.getString(0);

        let matrix4X4_ParentChild = [];// binary.consume(16 * 4, 'arraybuffer');
        let matrix4X4_WorldPos = [];// binary.consume(16 * 4, 'arraybuffer');

        for(let i = 0; i < 16;i++){
            matrix4X4_ParentChild.push(binary.consume(4, 'float32'));
        }
        for(let i = 0; i < 16;i++){
            matrix4X4_WorldPos.push(binary.consume(4, 'float32'));
        }

        let subBone = false;
        let nextBrotherBone = false;
        let animationDataIndex = false;


        if (subBoneOffset !== 0) {

            binary.setCurrent(subBoneOffset);

            subBone = Model.parseBone(binary);
        }

        if (nextBrotherBoneOffset !== 0){
            binary.setCurrent(nextBrotherBoneOffset);
            nextBrotherBone = Model.parseBone(binary);
        }

        if (animationDataIndexOffset !== 0){
            binary.setCurrent(animationDataIndexOffset);

            animationDataIndex = Model.parseAnimationDataIndex(binary);
        }

        return {
            'myBoneOffset': myBoneOffset,
            'nextBrotherBoneOffset': nextBrotherBoneOffset,
            'parentBoneOffset': parentBoneOffset,
            'rootBoneOffset': rootBoneOffset,
            'subBoneOffset': subBoneOffset,
            'animationDataIndexOffset': animationDataIndexOffset,
            'boneName': boneName,
            'matrix4X4_ParentChild': matrix4X4_ParentChild,
            'matrix4X4_WorldPos': matrix4X4_WorldPos,
            'transform': [
                [ matrix4X4_WorldPos[0],matrix4X4_WorldPos[1],matrix4X4_WorldPos[2], ],
                [ matrix4X4_WorldPos[4],matrix4X4_WorldPos[5],matrix4X4_WorldPos[6], ],
                [ matrix4X4_WorldPos[8],matrix4X4_WorldPos[9],matrix4X4_WorldPos[10], ],
                [ matrix4X4_WorldPos[12],matrix4X4_WorldPos[13],matrix4X4_WorldPos[14], ],
            ],
            'subBone': subBone,
            'nextBrotherBone': nextBrotherBone,
            'animationDataIndex': animationDataIndex
        };

    }

    static parseAnimationDataIndex(binary ){
        let i;
        let result = {
            'numBone': binary.consume(4, 'int32'),
            'unknown': binary.consume(4, 'int32'),
            'rootBoneOffset': binary.consume(4, 'int32'),
            'animationDataOffset': binary.consume(4, 'int32'),
            'boneTransformOffset': binary.consume(4, 'int32'),
            'zero': binary.consume(4, 'int32'),
            'animationData': [],
            'boneTransform': []
        };


        if (result.animationDataOffset !== 0){
            binary.setCurrent(result.animationDataOffset);

            for(i = 0; i < result.numBone ; i++){
                result.animationData.push(
                    Model.parseAnimationData(binary)
                );
            }
        }

        if (result.boneTransformOffset !== 0){
            binary.setCurrent(result.boneTransformOffset);

            for(i = 0; i < result.numBone ; i++){
                result.boneTransform.push(
                    binary.consume(4 * 8, 'arraybuffer')
                );
            }
        }

        return result;

    }

    static parseAnimationData(binary ){

        return {
            'animationBoneId': binary.consume(2, 'int16'),
            'boneType': binary.consume(2, 'int16'),
            'BoneOffset': binary.consume(4, 'int32'),
        };

    }

    static parseEntry(binary ){
        let rootBoneOffset = binary.consume(4, 'int32');

        binary.seek(16);
        let objectInfoIndexOffset = binary.current();

        let firstObjectInfoOffset = binary.consume(4, 'int32');
        let lastObjectInfoOffset = binary.consume(4, 'int32');

        binary.seek(4);

        return {
            'objectInfoIndexOffset': objectInfoIndexOffset,
            'rootBoneOffset': rootBoneOffset,
            'firstObjectInfoOffset': firstObjectInfoOffset,
            'lastObjectInfoOffset': lastObjectInfoOffset,
        };

    }


    static readClump(binary ){

        let parsedEntry = Model.parseEntry(binary);

        binary.setCurrent(parsedEntry.rootBoneOffset);
        let parsedBone = Model.parseBone(binary);

        let parsedObjects = [];
        let objectInfo = {};

        if (parsedEntry.firstObjectInfoOffset !== parsedEntry.objectInfoIndexOffset ){

            binary.setCurrent(parsedEntry.firstObjectInfoOffset);


            do{
                let parsedObject = {
                    'materials': false,
                    'boneTransDataIndex': false
                };

                //32 bytes
                objectInfo = Model.parseObjectInfo( binary );
                binary.setCurrent(objectInfo.objectOffset);

                //cur + 180 byte block - 32 byte to get VertexElementType
                let object = Model.parseObject(binary);

                parsedObject.objectInfo = objectInfo;
                parsedObject.object = object;

                if (object.MaterialOffset !== 0){
                    binary.setCurrent(object.MaterialOffset);

                    parsedObject.materials = Model.parseMaterial(binary, object.NumMaterials );
                }

                if (object.BoneTransDataIndexOffset !== 0){
                    binary.setCurrent(object.BoneTransDataIndexOffset);

                    parsedObject.boneTransDataIndex = Model.parseBoneTransDataIndex(binary, object.BoneTransDataIndexOffset );
                }

                binary.setCurrent(objectInfo.nextObjectInfoOffset);

                parsedObjects.push(parsedObject);

            }while(objectInfo.nextObjectInfoOffset !== parsedEntry.objectInfoIndexOffset );

            return Model.normalizeResult( parsedEntry, parsedBone, parsedObjects);


        }

        return false;
    }


    static readName(binary){
        return binary.consume(40, 'nbinary').getString(0);
    }




    static normalizeResult(parsedEntry, parsedBone, parsedObjects){
        Model.allBones = [];

        function generateBoneStructure(boneData, objectParentBoneOffset){

            let bones = [];
            let tBone = createBone(boneData);
            Model.allBones.push(tBone);

            if (boneData.myBoneOffset === objectParentBoneOffset){
                Model.meshBone = tBone;
                tBone.userData.meshBone = true;
            }

            bones.push(tBone);

            if (boneData.subBone !== false) {
                let subBones = generateBoneStructure(boneData.subBone, objectParentBoneOffset);
                subBones.forEach(function (subBone) {
                    tBone.add(subBone);
                });
            }

            if (boneData.nextBrotherBone !== false) {
                let nextBones = generateBoneStructure(boneData.nextBrotherBone, objectParentBoneOffset);
                nextBones.forEach(function (subBone) {
                    bones.push(subBone);
                });
            }

            return bones;
        }

        function createBone( data ){

            let bone = new Bone();
            bone.name = data.boneName;

            //do not apply to the first bone...
            if (Model.allBones.length !== 0)
                bone.applyMatrix4(
                    (new Matrix4()).fromArray(data.matrix4X4_ParentChild)
                );

            return bone;
        }


        let result = {
            skeleton: false,

            bones: [],
            objects: []
        };

        //Normalize model data
        generateBoneStructure(parsedBone, parsedObjects[0].objectInfo.objectParentBoneOffset);
        result.skeleton = new Skeleton( Model.allBones );
        result.skeleton.bones.forEach(function(bone){
            bone.updateWorldMatrix();
        });

        parsedObjects.forEach(function (parsedObject, index) {

            let genericObject = {
                material: [],
                skinning: index === 0 ? parsedObject.object.skinDataFlag : false,
                meshBone: Model.meshBone,

                faces: [],
                faceVertexUvs: [[]],

                vertices: [],
                skinIndices: [],
                skinWeights: [],
            };

            parsedObject.materials.forEach(function (parsedMaterial) {
                // let material = new MeshStandardMaterial();
                // material.name = parsedMaterial.TexName;
                // material.skinning = genericObject.skinning;
                // material.vertexColors = VertexColors;
                //
                // genericObject.material.push(material);
                genericObject.material.push(parsedMaterial.TexName);
            });


            parsedObject.object.vertex.forEach(function (vertexInfo) {

                genericObject.vertices.push(
                    (new Vector3( vertexInfo.x, vertexInfo.y, vertexInfo.z ))
                );

                if (vertexInfo.maxWeight !== 0){
                    genericObject.skinIndices.push(new Vector4(
                        vertexInfo.boneID1,
                        vertexInfo.boneID2,
                        vertexInfo.boneID3,
                        vertexInfo.boneID4
                    ));

                    genericObject.skinWeights.push(new Vector4(
                        vertexInfo.weight1,
                        vertexInfo.weight2,
                        vertexInfo.weight3,
                        vertexInfo.weight4
                    ));
                }
            });

            let faceMaterial = [];
            parsedObject.object.mtlIds.forEach(function (mtl) {
                for(let i = mtl.StartFaceID; i <= mtl.StartFaceID + mtl.MaterialIDNumFace; i++){
                    faceMaterial[i] = mtl;
                }
            });

            let faceIndex = parsedObject.object.faceindex;
            for(let x = 0; x < faceIndex.length; x++){
                let face = new Face3( faceIndex[x],  faceIndex[x + 1], faceIndex[x + 2] );
                face.materialIndex = faceMaterial[x].MaterialID;

                face.vertexNormals =[
                    parsedObject.object.normals[face.a],
                    parsedObject.object.normals[face.b],
                    parsedObject.object.normals[face.c]
                ];

                if(parsedObject.object.UV1_array.length > 0){
                    genericObject.faceVertexUvs[0].push([
                        new Vector2(
                            parsedObject.object.UV1_array[face.a][0],
                            parsedObject.object.UV1_array[face.a][1]
                        ),
                        new Vector2(
                            parsedObject.object.UV1_array[face.b][0],
                            parsedObject.object.UV1_array[face.b][1]
                        ),
                        new Vector2(
                            parsedObject.object.UV1_array[face.c][0],
                            parsedObject.object.UV1_array[face.c][1]
                        ),
                    ]);
                }

                genericObject.faces.push(face);
                x += 2;
            }

            result.objects.push(genericObject);

        });


        return result;
    }

}
