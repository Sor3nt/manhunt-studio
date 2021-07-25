import Event from "./Event.js";

export default class TabNavigation{

    static tempDropStorage;

    /**
     * @param componentSection {ComponentSection}
     */
    constructor( componentSection ){
        this.relation = {};
        this.activeRelation = null;

        this.tabs = componentSection.container.find('.nav-tabs');
        this.content = componentSection.container.find('.nav-tabs-content');

        this.tabs.on('dragover', function (event) {
            event.preventDefault();
        });

        let _this = this;
        this.tabs.on('drop', function (event) {
            event.preventDefault();
            let dropped = TabNavigation.tempDropStorage;

            dropped.tabHandler.remove(dropped.component);
            _this.add(dropped.component);
            _this.show(dropped.component.displayName);

            TabNavigation.tempDropStorage = null;
        });

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
    delete(component){
        this.remove(component); //todo tmp...
    }

    /**
     * @param basedOnComponent {AbstractComponent}
     * @returns {string|null}
     */
    getNextPossibleTab( basedOnComponent ){
        let beforeComponent = null;
        let foundComponent = false;

        for(let name in this.relation){
            if (!this.relation.hasOwnProperty(name)) continue;

            if (basedOnComponent.displayName === name){
                foundComponent = true;
                if (beforeComponent !== null)
                    return beforeComponent;

            }else if (foundComponent === false){
                beforeComponent = name;
            }else if (foundComponent === true && beforeComponent === null){
                return name; //after component
            }
        }

        return beforeComponent;

    }

    remove(component){
        let nextPossible = this.getNextPossibleTab(component);
        this.relation[component.displayName].tab.remove();
        delete this.relation[component.displayName];

        if (nextPossible !== null)
            this.show(nextPossible);
    }
    /**
     * @param component {AbstractComponent}
     */
    add(component){
        if (this.relation[component.displayName] !== undefined)
            return;

        let _this = this;
        let tab = jQuery('<li draggable="true">').html(component.displayName).click(function () {

            _this.show(component.displayName);

        });

        tab.on('dragstart', function (event) {
            TabNavigation.tempDropStorage = {
                component: component,
                tabHandler: _this
            };
        });

        tab.append(jQuery('<span class="tab-close">x</span>').click(function () {
            _this.delete(component);
        }));

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