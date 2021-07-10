import Event from "./../Event.js";
import NBinary from "./../NBinary.js";
import Loader from "../Plugin/Loader.js";
import FileTree from "../Plugin/Component/FileTree.js";
import Studio from "./../Studio.js";
import Storage from "./../Storage.js";
import {ComponentSection} from "../Plugin/Components.js";
import IconBoxes from "../Plugin/Component/IconBoxes.js";

export default class ResourcesTree {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
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

        let iconBox = new IconBoxes({
            onClick: this.showTree
        });

        section.container.find('.nav-tabs-content').append(iconBox.element);

        jQuery.each({
            [Studio.WORLD]: 'globe-americas',
            [Studio.MODEL]: 'male',
            [Studio.TEXTURE]: 'images',
            [Studio.ANIMATION]: 'running',
        }, function (typeId, icon) {

            let tree = new FileTree({
                processType: parseInt(typeId),
                // onEntryClick: _this.onFileTreeNodeClick,
                // onFolderClick: _this.onFolderTreeNodeClick
            });


            tree.element.hide();
            iconBox.add(typeId, icon, tree.element);

            _this.trees[typeId] = tree;
            section.container.find('.nav-tabs-content').append(tree.element);

        });

        iconBox.show(Studio.TEXTURE);

        //
        //
        // this.fileTree = new FileTree({
        //     onEntryClick: this.onFileTreeNodeClick,
        //     onFolderClick: this.onFolderTreeNodeClick
        // });
        //
        // this.fileTree.addFolder(Studio.MODEL,"Manhunt 1");
        // this.fileTree.addFolder(Studio.TEXTURE,"Imported");


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

    onFolderTreeNodeClick(typeId, event){
        console.log("onFolderTreeNodeClick",typeId);

        event.preventDefault();
        return false;
    }

    onFileTreeNodeClick(entry, event){
        console.log("onFileTreeNodeClick",entry);

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
        let _this = this;
        let parsed = Loader.parse(file.binary, {});
        parsed.forEach(function (entry) {
            Storage.add(entry);


            Event.dispatch(Event.ENTRY_LOADED, {
                entry: entry
            });
        });

    }

}