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

export default class EntityTree extends AbstractComponent{
    name = "entityTree";
    displayName = "eTree";
    element = jQuery('<ul>').addClass('entityTree');

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

        let indexId = entry.props.glgEntry.props.getValue('CLASS');
        usedParentNode = this.nodes[indexId];

        //Gamefolder name
        if (usedParentNode === undefined){

            usedParentNode = new TreeNode({
                value: jQuery(`<div>
                        ${indexId.replace("EC_", '').toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
                                                        return match.toUpperCase();
                                                    })}
                    </div>`),
                onClick: function (props, event) {
                    _this.onParentClick(entry);
                }
            });
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

        if (entry.props.glgEntry.props.getValue('CLASS') === false){
            console.log("no class ", entry.props.glgEntry);

            return;
        }

        let usedParentNode = this.getParentNode(entry);

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