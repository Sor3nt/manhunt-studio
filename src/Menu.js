import Components from "./Plugin/Components.js";

export default class Menu{

    element = null;

    /**
     *
     * @type {Category[]}
     */
    children = [];

    constructor(){
        this.element = jQuery('<ul class="menu">');

        let topSection = Components.getSection('top');
        topSection.container.append(this.element);
    }

    closeAll(){

        this.children.forEach(function (category) {
            category.close();
        })
    }

    /**
     *
     * @param category {Category}
     */
    addCategory(category){
        if (this.children.indexOf(category) !== -1)
            return;

        this.children.push(category);

        this.element.append(category.element);
    }

    /**
     *
     * @param id
     * @returns {{}|null}
     */
    getStatesById(id){
        /**
         *
         * @type {AbstractType|null}
         */
        let found = null;
        this.children.forEach(function (category) {
            let type = category.getTypeById(id);
            if (type !== false)
                found = type;
        });

        return found === null ? null : found.states;
    }

}