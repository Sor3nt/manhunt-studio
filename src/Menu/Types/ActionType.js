import AbstractType from "./AbstractType.js";

export default class ActionType extends AbstractType{
    template = `
        <div class="type action">
            <span class="type action"></span>
        </div>
    `;

    /**
     *
     * @type {Function}
     */
    callback = null;

    /**
     *
     * @param props {{id:mix, label:string, callback: function}}
     */
    constructor(props){
        super(props);

        this.callback = props.callback;
        this.applyTemplate( this.template );
    }

    /**
     *
     * @param template {string}
     */
    applyTemplate(template){
        let _this = this;

        this.element = jQuery(template);
        this.element.find('span')
            .html(this.label)
            .click(function () {
                _this.triggerClick();
            })
        ;
    }

    triggerClick(){
        this.callback();
    }

}
