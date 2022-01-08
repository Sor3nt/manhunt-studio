import Helper from "../Helper.js";

export default class Area{

    /**
     *
     * @type {Node[]}
     */
    children = [];

    /**
     *
     * @type {string}
     */
    name = "newArea";

    /**
     *
     * @type {int}
     */
    color = 0x0;

    constructor(name){
        this.name = name;
        this.color = Helper.getRandomColor();
    }

    /**
     *
     * @param node {Node}
     */
    addNode(node){
        if (this.children.indexOf(node) !== -1)
            return;

        //apply the area color
        node.getMesh().children[0].material.color.setHex( this.color );
        node.getMesh().children[0].material.needsUpdate = true;

        node.color = this.color;
        this.children.push(node);
    }

    clear(){
        this.children.forEach(function (node) {
            node.remove();
        });

        this.children = [];
    }

    setLinesVisible(state){
        this.children.forEach(function (node) {
            node.relationsVisible(state);
        })
    }

    setNodeVisible(state){
        this.children.forEach(function (node) {
            node.nodeVisible(state);
        })
    }


}
