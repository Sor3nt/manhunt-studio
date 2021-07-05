import Event from "./../Event.js";
import NBinary from "./../NBinary.js";
import Loader from "../Plugin/Loader.js";
import FileTree from "../Plugin/Component/FileTree.js";
import Studio from "./../Studio.js";
import Storage from "./../Storage.js";

export default class ResourcesTree {

    /**
     * @param section {ComponentSection}
     */
    constructor(section){
        let _this = this;
        Event.on(Event.DROP_FILE, function (file) {
            _this.fileDropped(file);
        });

        this.fileTree = new FileTree({
            onEntryClick: this.onFileTreeNodeClick,
            onFolderClick: this.onFolderTreeNodeClick
        });

        this.fileTree.addFolder(Studio.MODEL,"Models");
        this.fileTree.addFolder(Studio.TEXTURE,"Textures");

        section.add(this.fileTree);

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
     * @param file {{file:NBinary, name: string}}
     */
    fileDropped(file){
        let parsed = Loader.parse(file.binary, {});

        let _this = this;
        parsed.forEach(function (entry) {
            Storage.add(entry);

            _this.fileTree.addEntry(entry);
        });

    }

}