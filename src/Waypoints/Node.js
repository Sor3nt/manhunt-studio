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
     * @type {Node[]}
     */
    children = [];

    /**
     *
     * @type {Line[]}
     */
    lines = [];

    /**
     *
     * @type {{{node:Node, line:line}}}
     */
    relatedNodes = {};

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

        if (this.children.indexOf(node) !== -1)
            return;

        this.children.push(node);


        let material = new LineBasicMaterial({color: 0x00ff00});
        // material.opacity = 0.2;
        // material.transparent = true;

        let geometry = new Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;

        geometry.vertices.push(this.position);
        geometry.vertices.push(node.position);

        let line = new Line(geometry, material);
        line.name = `${this.name}_to_${node.name}`;

        this.lines.push(line);
        this.relatedNodes[node.id] = {
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

        let relNode = this.relatedNodes[node.id];
        if (relNode === undefined) return;

        relNode.node.removeRelation(node);
        this.getMesh().parent.remove(relNode.line);

        delete this.relatedNodes[node.id];

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
        this.children.forEach(function (node) {
            node.getMesh().visible = state;
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

        for(let i in this.relatedNodes){
            if (!this.relatedNodes.hasOwnProperty(i)) continue;

            this.relatedNodes[i].node.removeRelation(this);
        }

        let mesh = this.getMesh();
        let scene = this.getMesh().parent;
        scene.remove(mesh);

        this.lines.forEach(function (line) {
            scene.remove(line);
        });

        Storage.remove(this.entity);
    }

}
