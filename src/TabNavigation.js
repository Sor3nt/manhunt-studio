import Event from "./Event.js";

export default class TabNavigation{

    /**
     * @param componentSection {ComponentSection}
     */
    constructor( componentSection ){
        this.relation = {};
        this.activeRelation = null;

        this.tabs = componentSection.container.find('.nav-tabs');
        this.content = componentSection.container.find('.nav-tabs-content');

        if (this.tabs.length === 0){
            this.tabs = jQuery('<ul class="nav nav-tabs">');
            componentSection.container.append(this.tabs);
        }

        if (this.content.length === 0){
            this.content = jQuery('<div class="nav-tabs-content">');
            componentSection.container.append(this.content);
        }
    }

    /**
     * @param component {AbstractComponent}
     */
    add(component){
        if (this.relation[component.displayName] !== undefined)
            return;

        let _this = this;
        let tab = jQuery('<li>').html(component.displayName).click(function () {

            _this.show(component.displayName);

        });

        tab.append(jQuery('<span class="tab-close">x</span>'));

        this.tabs.append(tab);
        component.element.addClass('component-' + component.name);
        this.content.append(component.element);

        this.relation[component.displayName] = {
            tab: tab,
            component: component
        };
    }

    /**
     * @param name {string}
     */
    show(name){

        if (this.activeRelation !== null){
            this.activeRelation.tab.removeClass('active');
            this.activeRelation.component.element.hide();
        }

        this.activeRelation = this.relation[name];
        this.activeRelation.tab.addClass('active');
        this.activeRelation.component.element.show();

        this.activeRelation.component.onFocus();

        if(this.activeRelation.component.props.entry !== undefined)
            Event.dispatch(Event.VIEW_ENTRY, { entry: this.activeRelation.component.props.entry });
    }
}