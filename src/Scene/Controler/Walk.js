import {Capsule} from "../../Vendor/Capsule.js";
import {Group, Vector3, Raycaster, Vector2, TextureLoader, RepeatWrapping} from "../../Vendor/three.module.js";
import {TransformControls} from "../Controls/TransformControls.js";
import WebGL from "../../WebGL.js";
import {OrbitControls} from "../Controls/OrbitControls.js";
import StudioScene from "../StudioScene.js";
import Event from "../../Event.js";
import Status from "../../Status.js";
import {RenderPass} from "../../Vendor/RenderPass.js";
import {OutlinePass} from "../../Vendor/OutlinePass.js";
import Studio from "../../Studio.js";
import Config from "../../Config.js";



export default class Walk {

    mode = "fly";
    keyStates = {
        modeSelectObject: false,
        ShiftLeft: false
    };


    // playerOnFloor = false;

    // worldOctree = new Octree();
    playerCollider = new Capsule(
        new Vector3(0, 0.35, 0),
        new Vector3(0, 1, 0),
        0.35
    );

    playerVelocity = new Vector3();
    playerDirection = new Vector3();


    /**
     *
     * @param sceneInfo {StudioSceneInfo}
     */
    constructor(sceneInfo) {
        this.sceneInfo = sceneInfo;
        this.sceneInfo.camera.rotation.order = 'YXZ';


        if (Config.outlineActiveObject){
            const renderPass = new RenderPass( sceneInfo.scene, sceneInfo.camera );
            WebGL.composer.addPass( renderPass );
            WebGL.composer.addPass( WebGL.effectFXAA );

            let bbox = sceneInfo.element.parentNode.getBoundingClientRect();
            this.outlinePass = new OutlinePass( new Vector2( bbox.width, bbox.height ), sceneInfo.scene, sceneInfo.camera );
            WebGL.composer.addPass( this.outlinePass );
        }


        let _this = this;

        document.addEventListener('keydown', (event) => {
            _this.keyStates[event.code] = true;
        });


        document.addEventListener('keyup', (event) => {
            _this.keyStates[event.code] = false;

            if (event.code === 'KeyQ')
                this.transform.setSpace( this.transform.space === 'local' ? 'world' : 'local' );
            if (event.code === 'KeyW')
                this.transform.setMode( 'translate' );
            if (event.code === 'KeyE')
                this.transform.setMode( 'rotate' );


            if (event.code === 'KeyR')
                this.transform.setMode( 'scale' );

            // if (event.code === 'KeyH')
            //     this.highlightModelsInRange(10);

            if (event.code === 'Escape') {
                if (this.mode === "route-selection"){
                    this.setMode("fly");
                    document.exitPointerLock();
                }
            }
            //

            //     _this.keyStates.modeSelectObject = false;
            //     _this.setMode("fly");
            // }
            //
            // if (event.code === 'KeyL') {
            //     _this.setMode("waypoint");
            // }

            if (event.code === 'KeyI') {
                _this.keyStates.modeSelectObject = !_this.keyStates.modeSelectObject;
                if (_this.keyStates.modeSelectObject)
                    _this.setMode("select");
                else
                    _this.setMode("fly");
            }
            if (event.code === 'KeyO') {

                console.log("cilds",sceneInfo.scene);
            }
        });

        WebGL.renderer.domElement.addEventListener('mousedown', () => {
            if (this.mode === "fly" || this.mode === "transform")
                document.body.requestPointerLock();
        });

        document.body.addEventListener('mousemove', (event) => {
            if ( (document.pointerLockElement === document.body && _this.mode === "fly" || _this.mode === "select") || _this.mode === "route-selection" ) {
                sceneInfo.camera.rotation.y -= event.movementX / 500;
                sceneInfo.camera.rotation.x -= event.movementY / 500;
            }

        });

        WebGL.renderer.domElement.addEventListener('click', function (event) {
            if (_this.keyStates.modeSelectObject && _this.mode === "select")
                _this.doRayCast(event);
        }, true);


        this.orbit = new OrbitControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.orbit.enableDamping = true;
        this.orbit.dampingFactor = 0.05;
        this.orbit.screenSpacePanning = false;
        this.orbit.minDistance = 0.5;
        this.orbit.maxDistance = 15.0;
        this.orbit.maxPolarAngle = Math.PI / 2;
        this.orbit.target.set(0, 0, 0);
        this.orbit.enabled = false;

        this.transform = new TransformControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.transform.traverse((obj) => { // To be detected correctly by OutlinePass.
            obj.isTransformControls = true;
        });

        this.transform.addEventListener('dragging-changed', function (event) {
            _this.orbit.enabled = !event.value;
        });

        this.transform.addEventListener( 'mouseUp', function (event) {
            _this.onObjectChanged(event);
        } );

        sceneInfo.scene.add(this.transform);

        this.setMode('fly');
    }

    onObjectChanged(){

        if (this.object.userData.entity === undefined)
            return;

        if (this.object.userData.entity.type === Studio.AREA_LOCATION){
console.error("TODO");
        }else{
            this.object.userData.entity.props.instance.setData({
                position: {
                    x: this.object.position.x,
                    y: this.object.position.y,
                    z: this.object.position.z,
                },
                rotation: {
                    x: this.object.quaternion.x,
                    y: this.object.quaternion.y,
                    z: this.object.quaternion.z,
                    w: this.object.quaternion.w
                }
            });

        }


        this.orbit.target.copy(this.object.position);
    }

    doRayCast(event) {

        let studioSceneInfo = StudioScene.getStudioSceneInfo(undefined);
        let camera = studioSceneInfo.camera;
        let domElement = WebGL.renderer.domElement;
        let scene = studioSceneInfo.scene;

        let _raycaster = new Raycaster();
        _raycaster.layers.enableAll();
        let _mouse = new Vector2();

        let rect = domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, camera);

        //TODO
        //refactor required ! Remove the "group" shit and add regular meshes ... then we can remove the recursive intersection

        //we want only game object, no helpers
        let childs = [];
        scene.children.forEach(function (child) {
            if (child.type === "Group" )
                childs.push(child);
        });

        //we need recursive flag because the Group has the position and the children was clicked :/
        let intersects = _raycaster.intersectObjects(childs, true);

        let clickedGroups = [];
        intersects.forEach(function (obj) {
            let parent = obj.object.parent;

            if (parent === null || parent.type !== "Group" || parent.name === "scene")
                return;
            clickedGroups.push(parent);
        });

        if (clickedGroups.length > 0) {
            console.log("RayCast Object", clickedGroups[0]);

            if (Config.outlineActiveObject)
                this.outlinePass.selectedObjects = [clickedGroups[0].children[0]];

            //TODO: doppeltes handling, haben das auch in der map.js focusEntry...
            this.setObject(clickedGroups[0]);
            this.setMode('transform');
            this.sceneInfo.lookAt = clickedGroups[0].userData.entity;

        }
    }

    getForwardVector() {

        this.sceneInfo.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();

        return this.playerDirection;
    }

    getSideVector() {
        // if (this.mode === "waypoint"){
        //     this.playerDirection = new Vector3(0, -1, 0);
        // }else{
            this.sceneInfo.camera.getWorldDirection(this.playerDirection);
            this.playerDirection.y = 0;
        // }

        this.playerDirection.normalize();
        this.playerDirection.cross(this.sceneInfo.camera.up);

        return this.playerDirection;
    }

    flyControls(deltaTime) {

        const speed = 25 + (this.keyStates['ShiftLeft'] ? 75 : 0);

        if (this.keyStates['KeyW'])
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(speed * deltaTime));

        if (this.keyStates['KeyS'])
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speed * deltaTime));

        if (this.keyStates['KeyA'])
            this.playerVelocity.add(this.getSideVector().multiplyScalar(-speed * deltaTime));

        if (this.keyStates['KeyD'])
            this.playerVelocity.add(this.getSideVector().multiplyScalar(speed * deltaTime));

        if (this.keyStates['KeyQ'])
            this.playerVelocity.y = 7;

        if (this.keyStates['KeyE'])
            this.playerVelocity.y = -7;

    }


    setObject(object) {
        this.object = object;

        this.sceneInfo.camera.lookAt(object.position);
        this.orbit.target.copy(object.position);

        this.transform.detach();
        this.transform.attach(object);

        if (object.userData.entity !== undefined)
            Event.dispatch(Event.VIEW_ENTRY, { entry: object.userData.entity });
    }

    update(delta) {

        if ((this.mode === "fly" && document.pointerLockElement === document.body) || this.mode === "route-selection" ) {
            this.flyControls(delta);

            const damping = Math.exp(-3 * delta) - 1;
            this.playerVelocity.addScaledVector(this.playerVelocity, damping);

            const deltaPosition = this.playerVelocity.clone().multiplyScalar(delta);
            this.playerCollider.translate(deltaPosition);

            this.sceneInfo.camera.position.copy(this.playerCollider.end);


        } else if (this.mode === "transform") {
            this.orbit.update(delta);
        }


    }

    //todo https://threejs.org/examples/?q=out#webgl_postprocessing_outline
    highlightModelsInRange(range){
        let studioSceneInfo = StudioScene.getStudioSceneInfo();

        let scene = studioSceneInfo.scene;

        let _this = this;
        scene.children.forEach(
            /**
             *
             * @param child {Mesh}
             */
            function (child) {
                let dist = child.position.distanceTo(_this.playerCollider.end);
                if (dist <= range){

                    child.children[0].material.forEach(function (material) {
                        material.wireframe = true;
                        material.needsUpdate = true;
                    })

                }
                // console.log(child.name, dist);
            }
        );

    }

    setMode(mode) {

        console.log("current mode", this.mode, "new mode", mode);

        if (this.mode === "transform" && mode !== "transform") {
            this.transform.detach();
            this.orbit.enabled = false;

            if (mode === "fly"){
                this.playerCollider.end.copy( this.orbit.object.position );
            }

            document.body.requestPointerLock();
        } else if (this.mode === "fly" &&  mode !== "fly") {
            document.exitPointerLock();
        }

        if (mode === "fly") {

            if (Config.outlineActiveObject)
                this.outlinePass.selectedObjects = [];

        }else if (mode === "transform") {
            this.orbit.enabled = true;
            this.keyStates.modeSelectObject = true;
        }

        if (mode === "fly"){
            Status.showInfo('world');
        }else if (mode === "select"){
            Status.showInfo('select');
        }else if (mode === "transform"){
            Status.showInfo('transform');
        }else if (mode === "route-selection"){
            Status.showInfo('route-selection');
        }

        this.mode = mode;
    }
}
