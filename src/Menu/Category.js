
export default class Category {

    /**
     *
     * @type {int|null}
     */
    id = null;

    enabled = true;

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
     * @param props {{id:mix, label: string, enabled:boolean, callback: function }}
     */
    constructor(props){
        this.id = props.id;
        this.enabled = props.enabled === undefined ? true : props.enabled;
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
                if (_this.enabled)
                    _this.triggerClick();
            })
        ;

        if (this.enabled === false)
            this.disable();

        this.list = this.element.find('ul');
        this.list.hide();
    }

    triggerClick(){
        this.list.hide();
        this.states.open = !this.states.open;
        if (this.states.open === true){
            this.list.show();
        }else{
            this.close();
        }

        if (this.callback !== null)
            this.callback(this.states);
    }

    close() {
        if (this.states.open === false)
            return;

        this.states.open = false;
        this.list.hide();

        this.children.forEach(function (category) {
            category.close();
        });
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

        let container = jQuery('<li>');

        if (menuType.enabled === false)
            menuType.disable();

        this.list.append(
            container.append(menuType.element)
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

    getById(id){
        if (this.childrenById[id] !== undefined){
            return this.childrenById[id];
        }

        let subResult = false;
        this.children.forEach(function (child) {
            if (subResult !== false) return;
            if (child instanceof Category){
                subResult = child.getById(id);
            }

        });

        return subResult;

    }


    enable(){
        this.element.removeClass('disabled');
        this.enabled = true;
    }

    disable(){
        this.element.addClass('disabled');
        this.enabled = false;
    }
}
