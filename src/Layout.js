import ResourcesTree from "./Layout/ResourcesTree.js";
import Texture from "./Layout/Texture.js";
import Model from "./Layout/Model.js";
import Components from "./Plugin/Components.js";
import ResourceInfo from "./Layout/ResourceInfo.js";
import Map from "./Layout/Map.js";

export default class Layout{

    static createDefaultLayout() {
        new ResourcesTree(Components.getSection('left'));
        new Texture(Components.getSection('scene'));
        new Model(Components.getSection('scene'));
        new Map(Components.getSection('scene'));
        new ResourceInfo(Components.getSection('rightUpper'));


    }

}