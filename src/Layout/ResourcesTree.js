import Event from "./../Event.js";
import NBinary from "./../NBinary.js";
import Loader from "../Plugin/Loader.js";
import FileTree from "../Plugin/Component/FileTree.js";
import Studio from "./../Studio.js";
import Storage from "./../Storage.js";
import {ComponentSection} from "../Plugin/Components.js";
import IconBoxes from "../Plugin/Component/IconBoxes.js";
import SemanticallyTree from "./SemanticallyTree.js";
import Components from "../Plugin/Components.js";
import StudioScene from "../Scene/StudioScene.js";

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

        Event.on(Event.ENTRY_LOADED, function (props) {
            _this.addEntry(props.entry);
        });

        Event.on(Event.MAP_ENTITIES_LOADED, function (props) {
            new SemanticallyTree(Components.getSection('left'), props.entry);
        });

        /**
         * @type {{[Studio.WORLD]: FileTree,[Studio.MODEL]: FileTree,[Studio.TEXTURE]: FileTree,[Studio.ANIMATION]: FileTree }}
         */
        this.trees = {};

        this.iconBox = new IconBoxes();

        this.container.append(this.iconBox.element);

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
    }


    onFileTreeNodeClick(entry, event){

        Event.dispatch(Event.OPEN_ENTRY, { entry: entry });

        if (entry.type === Studio.ANIMATION){
            StudioScene.activeSceneInfo.playAnimationOnActiveElement(entry);
        }

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
}