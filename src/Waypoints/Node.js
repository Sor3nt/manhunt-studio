import {Geometry, Line, LineBasicMaterial, BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3} from "../Vendor/three.module.js";
import Storage from "../Storage.js";

export default class Node{

    /**
     *
     * @type {int}
     */
    id = 0;

    /**
     *
     * @type {{{node:Node, line:line}}}
     */
    children = [];

    /**
     *
     * @type {Line[]}
     */
    lines = [];


    /**
     *
     * @type {string}
     */
    name = "newNode";

    /**
     *
     * @type {Result|null}
     */
    entity = null;

    /**
     *
     * @type {Vector3}
     */
    position = new Vector3(0,0,0);

    /**
     *
     * @type {int}
     */
    color = 0x00ff00;

    /**
     *
     * @param entity {Result}
     */
    constructor(entity){
        this.id = entity.props.id;
        this.entity = entity;
        this.name = entity.name || 'newNode';

        if(entity.props.position !== undefined)
            this.position = entity.props.position;
    }

    /**
     *
     * @returns {Group}
     */
    getMesh(){
       if (this.entity.mesh !== null)
           return this.entity.mesh;

        const geometry = new BoxGeometry(0.25, 0.25, 0.25);
        const material = new MeshBasicMaterial({color: this.color});
        // material.opacity = 0.5;
        // material.transparent = true;

        const cube = new Mesh(geometry, material);
        cube.name = this.name;

        let group = new Group();
        group.position.copy(this.position);
        group.name = this.name;
        group.userData.entity = this.entity;
        group.add(cube);

        this.entity.mesh = group;

        return this.entity.mesh;
    }

    /**
     *
     * @param node {Node}
     */
    addRelation(node){

        if(node === this)
            return;

        if (this.children[node.id] !== undefined)
            return;



        let material = new LineBasicMaterial({color: 0x00ff00});
        // material.opacity = 0.2;
        // material.transparent = true;

        let geometry = new Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;

        geometry.vertices.push(this.getMesh().position);
        geometry.vertices.push(node.getMesh().position);

        let line = new Line(geometry, material);
        line.name = `${this.name}_to_${node.name}`;

        this.lines.push(line);
        this.children[node.id] = {
            node: node,
            line: line
        };

        this.getMesh().parent.add(line);
    }

    /**
     *
     * @param node {Node}
     */
    removeRelation(node){

        let relNode = this.children[node.id];
        if (relNode === undefined) return;

        let mesh = this.getMesh();
        let scene = mesh.parent;
        if (scene !== null)
            scene.remove(relNode.line);

        this.entity.props.waypoints = this.entity.props.waypoints.filter(function (waypoint) {
            return !(waypoint.linkId === relNode.node.id);
        });


        delete this.children[node.id];

    }

    /**
     *
     * @param state {int}
     */
    relationsVisible(state){
        this.lines.forEach(function (line) {
            line.visible = state;
        })
    }

    /**
     *
     * @param state {int}
     */
    nodeVisible(state){
        this.children.forEach(function (child) {
            child.node.getMesh().visible = state;
        });
    }

    /**
     *
     * @param state {int}
     */
    highlight(state){
        let mesh = this.getMesh().children[0];
        mesh.material.color.set(state ? 0xff0000 : this.color);
        // mesh.material.opacity = state ? 1 : 0.2;
        mesh.material.transparent = !state;
        mesh.material.needsUpdate = true;
    }

    remove(){
        //remove node object
        let mesh = this.getMesh();
        let scene = mesh.parent;
        if (scene !== null){
            scene.remove(mesh);

            //remove relation lines
            this.lines.forEach(function (line) {
                scene.remove(line);
            });
        }

        //remove relations TO this node
        for(let i in this.children){
            if (!this.children.hasOwnProperty(i)) continue;

            this.children[i].node.removeRelation(this);
        }

        this.children = [];
        Storage.remove(this.entity);
    }

}
