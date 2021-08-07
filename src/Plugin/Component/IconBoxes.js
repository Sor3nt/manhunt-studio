import AbstractComponent from "./Abstract.js";

export default class IconBoxes extends AbstractComponent{
    name = "IconBoxes";
    displayName = "IconBoxes";
    element = jQuery('<ul>').addClass('icon-boxes');

    treeByTypeId = {};
    contentByTypeId = {};
    iconByTypeId = {};

    /**
     * @type {jQuery}
     */
    active = undefined;

    /**
     *
     * @type {FileTree}
     */
    activeTree = undefined;

    constructor() {
        super({});
    }

    show(typeId){
        if (this.active !== undefined)
            this.active.hide().removeClass('active');

        this.activeTree = this.treeByTypeId[typeId];
        this.active = this.contentByTypeId[typeId];
        this.active.show().addClass('active');

        this.element.find('li').removeClass('active');
        this.iconByTypeId[typeId].addClass('active');

    }

    onClick(typeId){
        this.show(typeId);
    }

    /**
     *
     * @param typeId {string}
     * @param iconName {string}
     * @param content {jQuery}
     * @param tree {FileTree}
     */
    add(typeId, iconName, content, tree){
        let _this = this;

        let li = jQuery('<li>');
        let icon = jQuery(`<i class="fas fa-${iconName}">`);

        li.click(function () {
            _this.element.find('li').removeClass('active');
            li.addClass('active');
            _this.onClick(typeId);
        });

        li.append(icon);
        this.element.append(li);
        this.treeByTypeId[typeId] = tree;
        this.contentByTypeId[typeId] = content;
        this.iconByTypeId[typeId] = li;
    }


}