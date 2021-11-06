import ResourcesTree from "./Layout/ResourcesTree.js";
import Texture from "./Layout/Texture.js";
import Model from "./Layout/Model.js";
import Components from "./Plugin/Components.js";
import ResourceInfo from "./Layout/ResourceInfo.js";
import Map from "./Layout/Map.js";
import GlgEditor from "./Layout/GlgEditor.js";

export default class Layout{

    /**
     * @type {Model}
     */
    model = null;

    static createDefaultLayout() {
        new ResourcesTree(Components.getSection('left'));
        new Texture(Components.getSection('scene'));
        Layout.model = new Model(Components.getSection('scene'));
        new Map(Components.getSection('scene'));
        new ResourceInfo(Components.getSection('rightUpper'));
        new GlgEditor(Components.getSection('rightLower'));


    }

}