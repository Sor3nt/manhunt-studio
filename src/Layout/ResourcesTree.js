import Event from "./../Event.js";
import NBinary from "./../NBinary.js";
import Loader from "../Plugin/Loader.js";
import FileTree from "../Plugin/Component/FileTree.js";
import Studio from "./../Studio.js";
import Storage from "./../Storage.js";
import {ComponentSection} from "../Plugin/Components.js";
import IconBoxes from "../Plugin/Component/IconBoxes.js";

export default class ResourcesTree {

    container = jQuery('<div>');

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        this.section = section;
        let _this = this;
        Event.on(Event.DROP_FILE, function (file) {
            _this.fileDropped(file);
        });

        Event.on(Event.ENTRY_LOADED, function (props) {
            _this.addEntry(props.entry);
        });

        /**
         *
         * @type {{[Studio.WORLD]: FileTree,[Studio.MODEL]: FileTree,[Studio.TEXTURE]: FileTree,[Studio.ANIMATION]: FileTree }}
         */
        this.trees = {};

        this.iconBox = new IconBoxes({
            onClick: this.showTree
        });

        section.tabNavigation.content.append(this.iconBox.element);

        jQuery.each({
            [Studio.MAP]: 'globe-americas',
            [Studio.MODEL]: 'male',
            [Studio.TEXTURE]: 'images',
            [Studio.ANIMATION]: 'running',
        }, function (typeId, icon) {
            _this.createTree(typeId, icon);
        });

        //show per default the MODEL section
        this.iconBox.show(Studio.MODEL);

        this.section.tabNavigation.add({
            displayName: 'Resources',
            element: this.container
        });
    }

    createTree(typeId, icon){

        let tree = new FileTree({
            processType: parseInt(typeId),
            onEntryClick: this.onFileTreeNodeClick
        });

        let container = jQuery('<div>');
        let searchField = jQuery('<div>').html(
            `<div class="filter input-group input-group-sm">
                      <input type="text" class="form-control">
                      <div class="input-group-append">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                      </div>
                    </div>`
        );
        container.append(searchField);
        container.append(tree.element);

        container.hide();
        this.iconBox.add(typeId, icon, container);

        this.trees[typeId] = tree;

        this.container.append(container);

        // this.section.tabNavigation.content.append(container);

    }

    showTree(typeId){
        /**
         * @type {FileTree}
         */
        let tree = this.trees[typeId];
        if (tree === undefined)
            return;

        tree.element.show();
    }


    onFileTreeNodeClick(entry, event){

        Event.dispatch(Event.OPEN_ENTRY, { entry: entry });

        event.preventDefault();
        return false;
    }

    /**
     * @type {Result}
     */
    addEntry(entry){
        /**
         * @type {FileTree}
         */
        let tree = this.trees[entry.type];
        if (tree === undefined)
            return;

        tree.addEntry(entry);
    }

    /**
     * @param file {{binary:NBinary, name: string}}
     */
    fileDropped(file){
        let parsed = Loader.parse(file.binary, {});
        parsed.forEach(function (entry) {
            Storage.add(entry);

            Event.dispatch(Event.ENTRY_LOADED, {
                entry: entry
            });
        });

    }

}