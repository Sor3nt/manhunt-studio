import AbstractComponent from "./Abstract.js";

export default class FileTree extends AbstractComponent{
    name = "fileTree";
    displayName = "Tree";
    element = jQuery('<ul>');

    folder = {};

    /**
     * @param props {{}}
     */
    constructor(props) {
        super(props);
    }

    addFolder(typeId, name){
        let _this = this;
        let element = jQuery('<li>').html(name).click(function (event) {
            return _this.props.onFolderClick(typeId, event);
        });

        let container = jQuery('<ul>');

        element.append(container);
        this.element.append(element);
        this.folder[typeId] = container;
    }


    /**
     * @param entry {Result}
     */
    addEntry(entry){

        let container = this.folder[entry.type];

        let _this = this;
        let element = jQuery('<li>').html(entry.name).click(function (event) {
            return _this.props.onEntryClick(entry, event);
        });

        container.append(element);
    }
}