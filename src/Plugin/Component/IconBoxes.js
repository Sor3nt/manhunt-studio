import AbstractComponent from "./Abstract.js";

export default class IconBoxes extends AbstractComponent{
    name = "IconBoxes";
    displayName = "IconBoxes";
    element = jQuery('<ul>').addClass('icon-boxes');

    contentByTypeId = {};
    iconByTypeId = {};

    /**
     * @type {jQuery}
     */
    active = undefined;

    /**
     * @param props {{onClick: function}}
     */
    constructor(props) {
        super(props);
    }

    show(typeId){
        if (this.active !== undefined)
            this.active.hide().removeClass('active');

        this.active = this.contentByTypeId[typeId];
        this.active.show().addClass('active');

        this.element.find('li').removeClass('active');
        this.iconByTypeId[typeId].addClass('active');

    }

    onClick(typeId){
        this.show(typeId);
    }

    add(typeId, iconName, content){
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
        this.contentByTypeId[typeId] = content;
        this.iconByTypeId[typeId] = li;
    }


}