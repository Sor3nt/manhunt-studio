import {Capsule} from "../../Vendor/Capsule.js";
import {Vector3, Raycaster, Vector2} from "../../Vendor/three.module.js";
import {TransformControls} from "../Controls/TransformControls.js";
import WebGL from "../../WebGL.js";
import {OrbitControls} from "../Controls/OrbitControls.js";
import StudioScene from "../StudioScene.js";
import Studio from "../../Studio.js";
import Event from "../../Event.js";


export default class Walk {

    mode = "fly";
    keyStates = {
        modeSelectObject: false
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


            if (event.code === 'KeyI') {
                _this.keyStates.modeSelectObject = !_this.keyStates.modeSelectObject;
                if (_this.keyStates.modeSelectObject)
                    _this.setMode("select");
                else
                    _this.setMode("fly");
            }
        });

        document.addEventListener('mousedown', () => {
            if (this.mode === "fly")
                document.body.requestPointerLock();
        });

        document.body.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                sceneInfo.camera.rotation.y -= event.movementX / 500;
                sceneInfo.camera.rotation.x -= event.movementY / 500;
            }
        });

        WebGL.renderer.domElement.addEventListener('click', function (event) {
            if (_this.keyStates.modeSelectObject)
                _this.doRayCast(event);
        }, true);


        this.orbit = new OrbitControls(sceneInfo.camera, WebGL.renderer.domElement);
        this.orbit.enableDamping = true;
        this.orbit.dampingFactor = 0.05;
        this.orbit.screenSpacePanning = false;
        this.orbit.minDistance = 0.5;
        this.orbit.maxDistance = 40.0;
        this.orbit.maxPolarAngle = Math.PI / 2;
        this.orbit.target.set(0, 0, 0);
        this.orbit.enabled = false;

        this.transform = new TransformControls(sceneInfo.camera, WebGL.renderer.domElement);
        // this.transform.
        this.transform.addEventListener('dragging-changed', function (event) {
            _this.orbit.enabled = !event.value;
        });

        this.transform.addEventListener( 'mouseUp', function (event) {
            _this.onObjectChanged(event);
        } );

        sceneInfo.scene.add(this.transform);

    }

    onObjectChanged(event){

        this.object.userData.entity.props.instance.setData({
            position: {
                x: this.object.position.x,
                y: this.object.position.y,
                z: this.object.position.z,
            },
            rotation: {
                x: this.object.rotation.x,
                y: this.object.rotation.y,
                z: this.object.rotation.z,
                w: this.object.rotation.w
            },
        });
    }

    doRayCast(event) {

        let studioSceneInfo = StudioScene.getStudioSceneInfo();
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
            if (parent.type !== "Group" || parent.userData.entity === undefined)
                return;
            clickedGroups.push(parent);
        });

        if (clickedGroups.length > 0) {
            console.log("RayCast Object", clickedGroups[0]);
            this.setObject(clickedGroups[0]);
            this.setMode('transform');
        }
    }

    getForwardVector() {

        this.sceneInfo.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();

        return this.playerDirection;
    }

    getSideVector() {
        this.sceneInfo.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.sceneInfo.camera.up);

        return this.playerDirection;
    }

    flyControls(deltaTime) {

        const speed = 25;

        if (this.keyStates['KeyW'])
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(speed * deltaTime));

        if (this.keyStates['KeyS'])
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(-speed * deltaTime));

        if (this.keyStates['KeyA'])
            this.playerVelocity.add(this.getSideVector().multiplyScalar(-speed * deltaTime));

        if (this.keyStates['KeyD'])
            this.playerVelocity.add(this.getSideVector().multiplyScalar(speed * deltaTime));

        if (this.keyStates['KeyE'])
            this.playerVelocity.y = 7;

        if (this.keyStates['KeyQ'])
            this.playerVelocity.y = -7;

    }


    setObject(object) {
        this.object = object;

        let relativeCameraOffset = new Vector3(0, 2, -3);
        object.updateMatrixWorld();
        let cameraOffset = relativeCameraOffset.applyMatrix4(object.matrixWorld);

        this.sceneInfo.camera.position.lerp(cameraOffset, 0.1);
        this.sceneInfo.camera.lookAt(object.position);
        this.orbit.target.copy(object.position);

        this.transform.detach();
        this.transform.attach(object);

        Event.dispatch(Event.VIEW_ENTRY, { entry: object.userData.entity });
    }

    update(delta) {

        if (this.mode === "fly" && document.pointerLockElement === document.body) {
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

    setMode(mode) {
        if (this.mode === "transform" && mode !== "transform") {
            this.transform.detach();
            this.orbit.enabled = false;

            document.body.requestPointerLock();
        } else if (this.mode === "fly" && mode !== "fly") {
            document.exitPointerLock();
        } else if (mode === "transform") {
            this.orbit.enabled = true;
        }


        this.mode = mode;
    }
}