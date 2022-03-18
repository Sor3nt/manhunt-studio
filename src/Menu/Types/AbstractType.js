export default class AbstractType{
    states = {};

    enabled = true;

    template = ``;

    element = null;

    /**
     *
     * @type {mix}
     */
    id = null;

    /**
     *
     * @type {string}
     */
    label = "";

    /**
     *
     * @param props {{id:mix, label:string, enabled: boolean}}
     */
    constructor(props){
        this.id = props.id;
        this.label = props.label;
        this.enabled = props.enabled === undefined ? true : props.enabled;
    }

    triggerClick(){}
    close(){}

    getTypeById(id){ return false; }

    enable(){
        this.element.removeClass('disabled');
        this.enabled = true;
    }

    disable(){
        this.element.addClass('disabled');
        this.enabled = false;
    }


}
