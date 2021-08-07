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
     */
    constructor(section){
        this.section = section;
        let _this = this;
        // Event.on(Event.DROP_FILE, function (file) {
        //     _this.fileDropped(file);
        // });

        Event.on(Event.ENTRY_LOADED, function (props) {
            _this.addEntry(props.entry);
        });

        /**
         *
         * @type {{[Studio.WORLD]: FileTree,[Studio.MODEL]: FileTree,[Studio.TEXTURE]: FileTree,[Studio.ANIMATION]: FileTree }}
         */
        this.trees = {};


        this.iconBox = new IconBoxes();

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
        this.iconBox.onClick(Studio.MODEL);

        this.section.tabNavigation.add({
            displayName: 'Resources',
            element: this.container
        });
    }


    onFilter(val){
        if (this.iconBox.activeTree === undefined)
            return;

        this.iconBox.activeTree.filter(val);

    }

    createTree(typeId, icon){

        let tree = new FileTree({
            processType: parseInt(typeId),
            onEntryClick: this.onFileTreeNodeClick
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

        // this.section.tabNavigation.content.append(container);

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

    // /**
    //  * todo: should not be here, it is a part of DropFile.js
    //  * @param file {{binary:NBinary, name: string}}
    //  */
    // fileDropped(file){
    //     console.log(file);
    //     let parsed = Loader.parse(file.binary, {});
    //     parsed.forEach(function (entry) {
    //         Storage.add(entry);
    //
    //         Event.dispatch(Event.ENTRY_LOADED, {
    //             entry: entry
    //         });
    //     });
    //
    // }

}