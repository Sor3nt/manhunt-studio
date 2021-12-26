import AbstractType from "./AbstractType.js";
import CheckboxType from "./CheckboxType.js";

export default class SelectboxType extends AbstractType{
    template = `
        <div >
        
        </div>
    `;

    element = null;


    /**
     *
     * @type {Function}
     */
    callback = null;

    /**
     *
     * @type {CheckboxType[]}
     */
    children = [];

    /**
     *
     * @param props {{id:mix, values:string[], callback: function}}
     */
    constructor(props){
        super(props);


        this.states.active = null;

        this.callback = props.callback;
        this.applyTemplate( this.template );


        let _this = this;
        props.values.forEach(function (value) {
            let checkboxType = new CheckboxType({
                id: _this.id + '-' + value,
                label: value,
                callback: function (states) {

                    if(states.active){
                        _this.triggerClick(checkboxType);
                    }


                }
            });
            checkboxType.setState(null);
            _this.children.push(checkboxType);
            _this.element.append(checkboxType.element);
        });
    }

    /**
     *
     * @param template {string}
     */
    applyTemplate(template){
        this.element = jQuery(template);
    }

    /**
     *
     * @param checkboxType {CheckboxType}
     */
    triggerClick(checkboxType){

        this.children.forEach(function (child) {
            if (child !== checkboxType)
                child.setState(null);
        });


        this.states.active = checkboxType.id;
        this.callback(this.states);
    }

}
