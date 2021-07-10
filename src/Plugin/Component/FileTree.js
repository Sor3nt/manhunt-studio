import AbstractComponent from "./Abstract.js";
import Studio from "./../../Studio.js";

export class TreeNode{
    element = jQuery('<li>');

    /**
     * @type {jQuery}
     */
    children;

    /**
     *
     * @param props {{onClick: function, value: string}}
     */
    constructor(props) {
        let _this = this;
        this.element.append(props.value);
        this.element.click(function (event) {
            return props.onClick(props, event);
        });


    }

    /**
     * @param node {TreeNode}
     */
    addChild(node){

        if(this.children === undefined){
            this.children = jQuery('<ul>').addClass('children').hide();
            this.element.append(this.children);
        }

        this.children.append( node.element );
    }


}

export default class FileTree extends AbstractComponent{
    name = "fileTree";
    displayName = "Tree";
    element = jQuery('<ul>').addClass('fileTree');

    /**
     * @type {TreeNode}
     */
    activeParent;

    nodes = {};

    /**
     * @param props {{}}
     */
    constructor(props) {
        super(props);
    }


    /**
     * @param node {TreeNode}
     */
    addNode(node){
        this.element.append(node.element);
    }


    /**
     * @param entry {Result}
     */
    onParentClick(entry){
        let usedParentNode = this.getParentNode(entry);

        if (this.activeParent !== undefined)
            this.activeParent.children.hide();

        this.activeParent = usedParentNode;
        usedParentNode.children.show();

    }

    /**
     * @param entry {Result}
     * @return {TreeNode}
     */
    getParentNode( entry ){
        let gameId = entry.gameId;
        let _this = this;

        /**
         * @type {TreeNode}
         */
        let usedParentNode;

        //entry was imported
        if (gameId === -1){
            usedParentNode = this.nodes[Studio.IMPORTED];

            if (usedParentNode === undefined){
                usedParentNode = new TreeNode({
                    value: 'Imported',
                    onClick: function () {
                        _this.onParentClick(entry);
                    }
                });
                this.addNode(usedParentNode);
                this.nodes[Studio.IMPORTED] = usedParentNode;
            }

        }else{
            let game = Studio.config.getGame(gameId);
            let indexId = game.game + '_' + entry.file;
            usedParentNode = this.nodes[indexId];

            //Gamefolder name
            if (usedParentNode === undefined){
                usedParentNode = new TreeNode({
                    value: jQuery(`<div><i class="icon-game-${game.game}" />${entry.fileName}</div>`),
                    onClick: function () {
                        _this.onParentClick(entry);
                    }
                });
                this.addNode(usedParentNode);
                this.nodes[indexId] = usedParentNode;
            }

        }

        return usedParentNode;
    }

    /**
     * @param entry {Result}
     */
    addEntry(entry){

        if (this.props.processType !== entry.type)
            return;


        let usedParentNode = this.getParentNode(entry);

        let node = new TreeNode({
            value: entry.name,
            onClick: function () {

            }
        });

        usedParentNode.addChild(node);

    }
}