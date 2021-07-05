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
        let tab = jQuery('<li>').html(component.name).click(function () {
            component.onFocus();
        });

        this.tabs.append(tab);
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