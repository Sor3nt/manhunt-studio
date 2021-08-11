import Event from "./../Event.js";
import Studio from "./../Studio.js";
import Storage from "./../Storage.js";
import {ComponentSection} from "../Plugin/Components.js";
import IconBoxes from "../Plugin/Component/IconBoxes.js";
import EntityTree from "../Plugin/Component/EntityTree.js";

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
        //



        /**
         * @type {{[Studio.WORLD]: FileTree,[Studio.MODEL]: FileTree,[Studio.TEXTURE]: FileTree,[Studio.ANIMATION]: FileTree }}
         */
        this.trees = {};

        this.iconBox = new IconBoxes();

        this.container.append(this.iconBox.element);


        this.createTree(Studio.ENTITY, 'globe-americas');

        //show per default the MAP section
        this.iconBox.onClick(Studio.ENTITY);

        let entities = Storage.findBy({
            gameId: this.mapEntry.gameId,
            type: Studio.ENTITY
        });

        entities.forEach(function (entity) {
            // switch (entity.props.className) {
            //     case 'Base_Inst':
                    /**
                     * @type {EntityTree}
                     */
                    let tree = _this.trees[Studio.ENTITY];
                    tree.addEntry(entity);
                    // break;
            // }

            // console.log(entity);
        });


        this.section.tabNavigation.add({
            displayName: 'Semantic ' + mapEntry.level,
            element: this.container
        });
    }


    onFilter(val){
        if (this.iconBox.activeTree === undefined)
            return;

        this.iconBox.activeTree.filter(val);
    }

    createTree(typeId, icon){

        let tree = new EntityTree({
            processType: parseInt(typeId),
            onEntryClick: this.onTreeNodeClick
        });

        let container = jQuery('<div>');
        let searchField = jQuery('<div>').html(this.templates.search);

        let _this = this;
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
console.log("click ", entry);
        Event.dispatch(Event.MAP_FOCUS_ENTITY, { entry: entry });

        event.preventDefault();
        return false;
    }

}