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
        'ifp',      // Manhunt 1/2 Animation
        'bin',      // Manhunt 2 Execution Animation
        'glg',      // Manhunt 2 INI Files
        'ini',      // Manhunt 1 INI Files
        'pak',      // Manhunt 1 Container file
        'grf',      // Manhunt 1/2 Waypoints

    ];

    //it is disabled because of perforamcen issue in the current three version
    static outlineActiveObject = false;

    static debugLevel = 0;

}