import Event from "./../Event.js";
import Studio from "./../Studio.js";
import {ComponentSection} from "../Plugin/Components.js";
import IconBoxes from "../Plugin/Component/IconBoxes.js";
import EntityTree from "../Plugin/Component/EntityTree.js";
import Games from "../Plugin/Games.js";

export default class SemanticallyTree {

    container = jQuery('<div>');

    templates = {
        search: `
                <div class="filter input-group input-group-sm">
                  <input type="text" class="form-control">
                  <div class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                  </div>
                </div>
        `
    };

    /**
     * @param section {ComponentSection}
     * @param mapEntry {Result}
     */
    constructor(section, mapEntry){

        this.section = section;
        this.mapEntry = mapEntry;
        let _this = this;

        /**
         * @type {{[Studio.WORLD]: FileTree,[Studio.MODEL]: FileTree,[Studio.TEXTURE]: FileTree,[Studio.ANIMATION]: FileTree }}
         */
        this.trees = {};

        this.iconBox = new IconBoxes();

        this.container.append(this.iconBox.element);

        this.iconBox.element.hide(); //no usage right now

        this.createTree(Studio.ENTITY, 'globe-americas');

        //show per default the MAP section
        this.iconBox.onClick(Studio.ENTITY);

        let game = Games.getGame(this.mapEntry.gameId);
        let entities = game.findBy({
            type: Studio.ENTITY
        });

        entities.forEach(function (entity) {
            let tree = _this.trees[Studio.ENTITY];
            tree.addEntry(entity);
        });

        this.section.tabNavigation.add({
            displayName: mapEntry.level,
            element: this.container
        });
    }


    onFilter(val){
        if (this.iconBox.activeTree === undefined)
            return;

        this.iconBox.activeTree.filter(val);
    }

    createTree(typeId, icon){

        let _this = this;

        let tree = new EntityTree({
            processType: parseInt(typeId),
            onEntryClick: function (entry, event) {
                _this.onTreeNodeClick(entry, event);
            }
        });

        let container = jQuery('<div>');
        let searchField = jQuery('<div>').html(this.templates.search);

        searchField.find('input').keyup(function () {
            _this.onFilter($(this).val());
        });

        container.append(searchField);
        container.append(tree.element);
        container.hide();

        this.iconBox.add(typeId, icon, container, tree);
        this.trees[typeId] = tree;
        this.container.append(container);
    }


    onTreeNodeClick(entry, event){
        Event.dispatch(Event.MAP_FOCUS_ENTITY, { entry: entry, mapEntry: this.mapEntry });

        event.preventDefault();
        return false;
    }

}