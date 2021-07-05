export default class TabNavigation{

    /**
     * @param componentSection {ComponentSection}
     */
    constructor( componentSection ){
        this.relation = {};
        this.activeRelation = null;

        this.tabs = componentSection.container.find('.nav-tabs');
        this.content = componentSection.container.find('.nav-tabs-content');
    }

    /**
     * @param component {AbstractComponent}
     */
    add(component){
        let tab = jQuery('<li>').html(component.displayName).click(function () {
            component.onFocus();
        });

        tab.append(jQuery('<span class="tab-close">x</span>'));

        this.tabs.append(tab);
        component.element.addClass('component-' + component.name);
        this.content.append(component.element);

        this.relation[component.name] = {
            tab: tab,
            content: component.element
        };
    }

    /**
     * @param name {string}
     */
    show(name){
        if (this.activeRelation !== null){
            this.activeRelation.tab.removeClass('active');
            this.activeRelation.content.hide();
        }

        this.activeRelation = this.relation[name];
        this.activeRelation.tab.addClass('active');
        this.activeRelation.content.show();
    }
}