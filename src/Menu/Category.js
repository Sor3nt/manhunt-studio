
export default class Category {

    /**
     *
     * @type {int|null}
     */
    id = null;

    states = {
        open: false
    };

    /**
     *
     * @type {string}
     */
    template = `
        <li>
            <span></span>
            <ul></ul>
        </li>`
    ;

    /**
     *
     * @type {function}
     */
    callback = null;

    element = null;

    list = null;

    children = [];
    childrenById = {};

    /**
     *
     * @type {string}
     */
    label = "";

    /**
     *
     * @param props {{id:mix, label: string, callback: function }}
     */
    constructor(props){
        this.id = props.id;
        this.label = props.label;
        this.callback = props.callback || null;
        this.states.open = false;
        this.applyTemplate(this.template);
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

        this.list = this.element.find('ul');
        this.list.hide();
    }

    triggerClick(){
        this.list.hide();
        if (this.states.open === false){
            this.list.show();
        }

        this.states.open = !this.states.open;

        if (this.callback !== null)
            this.callback(this.states);
    }

    close() {
        if (this.states.open === false)
            return;

        this.states.open = false;
        this.list.hide();
    }


    clear(){
        this.list.html("");
        this.children = [];
        this.childrenById = {};
    }

    /**
     *
     * @param menuType {AbstractType}
     */
    addType(menuType){
        this.children.push(menuType);
        this.childrenById[menuType.id] = menuType;

        this.list.append(
            jQuery('<li>').append(menuType.element)
        );
    }

    /**
     *
     * @param category {Category}
     */
    addSubCategory(category){
        this.children.push(category);
        this.childrenById[category.id] = category;

        category.element.append('<i class="fas fa-angle-right" style="float: right"></i>');

        category.element.find('ul').addClass('sub-category');

        this.list.append(category.element);
    }

    getTypeById(id){
        if (this.childrenById[id] === undefined)
            return false;

        return this.childrenById[id];
    }
}
