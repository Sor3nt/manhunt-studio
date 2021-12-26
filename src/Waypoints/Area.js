
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

    constructor(name){
        this.name = name;
    }

    /**
     *
     * @param node {Node}
     */
    addNode(node){
        this.children.push(node);
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
