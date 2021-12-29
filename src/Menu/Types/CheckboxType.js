import AbstractType from "./AbstractType.js";

export default class CheckboxType extends AbstractType{
    template = `
        <div class="type checkbox">
            <span></span>
            <i class="fas fa-eye-slash" style="float: right"></i>
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

        this.states.active = false;
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
                if (_this.enabled)
                    _this.triggerClick();
            })
        ;
    }

    setState(state){
        let checkbox = this.element.find('i');
        checkbox.removeClass('fa-eye-slash');
        checkbox.removeClass('fa-eye');

        if (state === null){
            this.states.active = false;

        }else{
            checkbox.addClass(state ? 'fa-eye' : 'fa-eye-slash');
            this.states.active = state;
        }

        this.callback(this.states);
    }

    triggerClick(){
        this.setState(!this.states.active);
    }

}
