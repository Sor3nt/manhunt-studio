import {Geometry, Line, LineBasicMaterial} from "../Vendor/three.module.js";
import Helper from "../Helper.js";

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

    /**
     *
     * @type {int}
     */
    color = 0xff0000;

    isVisible = false;
    isHighlighted = false;

    /**
     *
     * @type {Result}
     */
    entity = null;

    /**
     *
     * @param name {string}
     * @param entity {Result}
     */
    constructor(name, entity){
        this.name = name;
        this.entity = entity;

    }

    clear(){

        let mesh = this.getMesh();
        if (mesh.parent !== null)
            mesh.parent.remove(mesh);

        this.children = [];
        this.entity.props.entries = [];
        this.entity.props.locations = [];

    }

    /**
     *
     * @param node {Node}
     */
    addNode(node){
        if (this.children.indexOf(node) === -1){
            this.children.push(node);

            if (this.entity.props.entries.indexOf(node.getId()) === -1){
                this.entity.props.entries.push(node.getId());
                this.entity.props.locations.push(node.entity);
            }
        }

        node.setHighlightColor(this.color);
        node.highlight(this.isHighlighted);

        if (this.isHighlighted)
            this.getMesh(); //regenerate line
    }

    /**
     *
     * @param area {Area}
     * @returns {boolean}
     */
    isRouteNodeInArea(area){
        let _this = this;
        let found = false;
        area.children.forEach(function (node) {
            if (found === true) return;

            if (_this.children.indexOf(node) !== -1)
                found = true;
        });

        return found;
    }

    /**
     *
     * @returns {Line}
     */
    getMesh(){
        let parent = false;
        if (this.mesh !== null && this.mesh.parent !== null)
            parent = this.mesh.parent;

        //note: Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.
        let material = new LineBasicMaterial({color: this.color, linewidth: 2});

        let geometry = new Geometry();
        geometry.verticesNeedUpdate = true;
        geometry.dynamic = true;

        this.children.forEach(function (node) {
            geometry.vertices.push(node.position);
        });

        let line = new Line(geometry, material);
        line.name = this.name;

        if (parent !== false){
            parent.add(line);
            parent.remove(this.mesh);
        }

        this.mesh = line;
        return this.mesh;
    }


    /**
     *
     * @param state {int}
     */
    setVisible(state){
        this.isVisible = state;
        this.getMesh().visible = state;
    }

    /**
     *
     * @param state {int}
     */
    highlight(state){
        let _this = this;
        this.isHighlighted = state;

        let mesh = this.getMesh();
        mesh.visible = state;

        this.children.forEach(function (node) {
            node.setHighlightColor(_this.color);
            node.highlight(state);
        });
    }

    remove(){
        let mesh = this.getMesh();
        let scene = mesh.parent;
        if(scene !== null)
            scene.remove(mesh);

        this.children = [];
    }

}
