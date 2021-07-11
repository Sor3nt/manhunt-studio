export default class Event{

    static DROP_FILE = 0;
    static ENTRY_LOADED = 1;
    static OPEN_ENTRY = 2;
    static VIEW_ENTRY = 3;

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