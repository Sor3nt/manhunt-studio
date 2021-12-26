import {Geometry, Line, LineBasicMaterial, Vector3} from "../Vendor/three.module.js";

export default class Route{

    /**
     *
     * @type {Line|null}
     */
    mesh = null;

    /**
     *
     * @type {Node[]}
     */
    children = [];

    /**
     *
     * @type {string}
     */
    name = "";

    constructor(name){
        this.name = name;
    }

    /**
     *
     * @param node {Node}
     */
    addNode(node){
        if (this.children.indexOf(node) === -1)
            this.children.push(node);
    }

    /**
     *
     * @returns {Line}
     */
    getMesh(){
        if (this.mesh !== null)
            return this.mesh;

        let material = new LineBasicMaterial({color: 0x00ff00});
        material.opacity = 0.5;
        material.transparent = true;

        let geometry = new Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;

        this.children.forEach(function (node) {
            geometry.vertices.push(node.position);
        });

        let line = new Line(geometry, material);
        line.name = this.name;

        this.mesh = line;
        return this.mesh;
    }


    /**
     *
     * @param state {int}
     */
    setVisible(state){
        this.getMesh().visible = state;
    }

    /**
     *
     * @param state {int}
     */
    highlight(state){

        let mesh = this.getMesh();
        mesh.material.color.set(state ? 0xff0000 : 0x00ff00);
        mesh.material.opacity = state ? 1 : 0.5;
        mesh.material.transparent = !state;
        mesh.material.needsUpdate = true;

        this.children.forEach(function (node) {
            node.highlight(state);
        });
    }

}
