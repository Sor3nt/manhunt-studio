// import Api from "./Api.js";
// import Games from "./Plugin/Games.js";

export default class Config {


    static fileFormats = [
        'inst',     // Instances from Manhunt 1/2
        'mdl',      // Manhunt 2 Model
        'dff',      // Manhunt 1 Model
        'tex',      // Manhunt 2 Texture
        'txd',      // Manhunt 1 Texture
        'bsp',      // Manhunt 1/2 Level/Map
        'glg',      // Manhunt 2 INI Files

    ];

    //it is disabled because of perforamcen issue in the current three version
    outlineActiveObject = false;

}