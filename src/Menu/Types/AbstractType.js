export default class AbstractType{
    states = {};

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
     * @param props {{id:mix, label:string}}
     */
    constructor(props){
        this.id = props.id;
        this.label = props.label;
    }

    triggerClick(){}

}
