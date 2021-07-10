import AbstractComponent from "./Abstract.js";

export default class IconBoxes extends AbstractComponent{
    name = "IconBoxes";
    displayName = "IconBoxes";
    element = jQuery('<ul>').addClass('icon-boxes');

    contentByTypeId = {};

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
            this.active.hide();

        this.active = this.contentByTypeId[typeId];
        this.active.show();
    }

    onClick(typeId){
        this.show(typeId);
    }

    add(typeId, iconName, content){
        let _this = this;

        let li = jQuery('<li>');
        let icon = jQuery(`<i class="fas fa-${iconName}">`);

        li.click(function () {
            _this.onClick(typeId);
        });

        li.append(icon);
        this.element.append(li);
        this.contentByTypeId[typeId] = content;
    }


}