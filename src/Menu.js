import Components from "./Plugin/Components.js";

export default class Menu{

    static container;

    static categories = {};

    static addCategory( name ){
        let category = jQuery('<li>').html(name);
        let child = jQuery('<ul>');
        child.hide();
        category.append(child);

        this.categories[name] = {
            container: category,
            childs: child
        };


        let _this = this;
        category.click(function (e) {
            Menu.container.find('li > ul').hide();

            if (category.hasClass('active')){
                Menu.container.find('> li').removeClass('active');
                return;
            }

            Menu.container.find('> li').removeClass('active');

            category.addClass('active');
            child.show();
        });
        Menu.container.append(category);
    }


    static addEntry(categoryName, name, onClick){
        this.categories[categoryName].childs.append(jQuery('<li>').html(name).click(function (e) {
            Menu.container.find('li > ul').hide();
            Menu.container.find('> li').removeClass('active');
            onClick();
            e.preventDefault();
            return false;

        }))
    }

    static create(){

        Menu.container = jQuery('<ul class="menu">');
        let top = Components.getSection('top');
        top.container.append(Menu.container);


    }

}