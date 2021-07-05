import TabNavigation from "./../TabNavigation.js";

export class ComponentSection{

    /**
     * @type {jQuery}
     */
    container = {};


    /**
     * @param name {string}
     * @param element {jQuery}
     */
    constructor(name, element){
        this.name = name;
        this.container = element;

        this.tabNavigation = new TabNavigation(this);
    }

    /**
     * @param component {AbstractComponent}
     */
    add(component){
        console.log("Add new component ", component.name, "to section", this.name, "container", this.container);

        this.tabNavigation.add(component);
    }


}

export default class Components{

    static sections = {};
    static components = [];


    static registerSections(){

        jQuery('[data-component-section]').each(function (index, element) {
            element = jQuery(element);
            let val = element.attr("data-component-section");

            Components.sections[val] = new ComponentSection(val, element);
        });
    }

    /**
     *
     * @param name
     * @returns {ComponentSection|boolean}
     */
    static getSection( name ){
        if (Components.sections[name] === undefined){
            console.error("Could not find section ", name);
            return false;
        }

        return Components.sections[name];
    }


}