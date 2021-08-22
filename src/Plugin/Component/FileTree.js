import AbstractComponent from "./Abstract.js";
import Games from "./../../Plugin/Games.js";

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
        this.props = props;
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

    filter(val){

        for(let name in this.nodes){
            if (!this.nodes.hasOwnProperty(name)) continue;

            this.nodes[name].children.find('li').show();
            this.nodes[name].children.find(':not(:icontains('+ val +'))').hide();
        }
    }

    /**
     * @param entry {Result}
     */
    onParentClick(entry){
        let usedParentNode = this.getParentNode(entry);
        if (this.activeParent === usedParentNode)
            return;

        if (this.activeParent !== undefined){
            this.activeParent.children.animate({
                left: "100%"
            }, 300);
            this.activeParent.element.removeClass('active');
        }

        this.activeParent = usedParentNode;
        usedParentNode.children.css('left', "100%").show().animate({
            left: "50%"
        });
        usedParentNode.element.addClass('active');

    }

    /**
     * @param entry {Result}
     * @return {TreeNode}
     */
    getParentNode( entry ){
        let _this = this;

        /**
         * @type {TreeNode}
         */
        let usedParentNode;

        let indexId = entry.level + '_' + entry.file;
        usedParentNode = this.nodes[indexId];

        //Gamefolder name
        if (usedParentNode === undefined){


            if (entry.fileName.indexOf('scene2') !== -1 || entry.fileName.indexOf('scene3') !== -1)
                return false;

            let game = Games.getGame(entry.gameId);

            if (entry.fileName.indexOf('scene1') !== -1){
                usedParentNode = new TreeNode({
                    value: jQuery(`<div style="display: inline-block;">
                        <i class="icon-game-${game.game}" style="float:left"></i>
                        <div style="float:left">
                        
                            <div class="badges">
                                <span class="badge badge-warning">${game.platform}</span>
                            </div>
                             ${entry.level}
                        </div>

                    </div>`),
                    onClick: function (props, event) {
                        // let childs = _this.nodes[indexId].children.find('li');
                        // if (childs.length > 1){
                            _this.onParentClick(entry);
                        // }else{
                            // jQuery(usedParentNode.children.find('li').get(0)).click();
                            // _this.nodes[indexId].props.onClick(_this.nodes[indexId].props, event);
                            // console.log("JOJO", childs);
                        // }
                    }
                });
            }else{
                usedParentNode = new TreeNode({
                    value: jQuery(`<div style="display: inline-block;">
                        <i class="icon-game-${game.game}" style="float:left"></i>
                        <div style="float:left">
    
                            <div class="badges">
                                <span class="badge badge-warning">${game.platform}</span>
                                <span class="badge badge-secondary">${entry.level}</span>
                            </div>
                            ${entry.fileName}
                        </div>
                    </div>`),
                    onClick: function (props, event) {
                        _this.onParentClick(entry);
                    }
                });
            }


            this.addNode(usedParentNode);
            this.nodes[indexId] = usedParentNode;
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
        if (usedParentNode === false)
            return;

        let _this = this;
        let node = new TreeNode({
            value: entry.name,
            onClick: function (props, event) {
                usedParentNode.children.find('li').removeClass('active');
                jQuery(event.target).addClass('active');
                _this.props.onEntryClick(entry, event);
            }
        });

        usedParentNode.addChild(node);

    }
}