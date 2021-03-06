export default class Event{

    static DROP_FILE = 0;
    static ENTRY_LOADED = 1;
    static OPEN_ENTRY = 2;
    static VIEW_ENTRY = 3;
    static MAP_ENTITIES_LOADED = 4;
    static MAP_FOCUS_ENTITY = 5;
    static CLOSE_COMPONENT = 6;
    static WAYPOINT_SHOW_RELATIONS = 7;
    static WAYPOINT_SHOW_NODES = 8;

    static events = {};

    static on(eventName, callback){
        if(Event.events[eventName] === undefined)
            Event.events[eventName] = [];

        Event.events[eventName].push(callback);
    }

    static dispatch(eventName, props){
        for(let i in Event.events[eventName]){
            if (!Event.events[eventName].hasOwnProperty(i))
                continue;

            Event.events[eventName][i](props);

        }
    }

}