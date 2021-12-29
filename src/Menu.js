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

    getById(id){
        /**
         *
         * @type {AbstractType|bool}
         */
        let found = false;
        this.children.forEach(function (category) {
            if (found !== false)
                return;
            console.log("check", category.id, id);
            if (category.id === id){
                console.log("found", category.id, id);
                found = category;
                return;
            }


            let type = category.getById(id);
            if (type !== false)
                found = type;
        });

        return found === null ? null : found;
    }

    /**
     *
     * @param id
     * @returns {{}|null}
     */
    getStatesById(id){
        let type = this.getById(id);
        return type === null ? null : type.states;
    }

}