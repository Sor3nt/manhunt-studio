import ResourcesTree from "./Layout/ResourcesTree.js";
import Texture from "./Layout/Texture.js";
import Components from "./Plugin/Components.js";

export default class Layout{

    static createDefaultLayout() {
        new ResourcesTree(Components.getSection('left'));
        new Texture(Components.getSection('scene'));


    }

}