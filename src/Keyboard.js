export default class Keyboard {
    static keyDownCallbacks = {};
    static keyUpCallbacks = {};
    static keyStates = {
        // modeSelectObject: false,
        ShiftLeft: false
    };

    static setup(){

        document.addEventListener('keydown', function(event){
            Keyboard.keyStates[event.code] = true;

            if (Keyboard.keyDownCallbacks[event.code] !== undefined){
                Keyboard.keyDownCallbacks[event.code].forEach(function (callback) {
                    callback();
                });
            }

        });

        document.addEventListener('keyup', function(event){
            Keyboard.keyStates[event.code] = false;

            if (Keyboard.keyUpCallbacks[event.code] !== undefined){
                Keyboard.keyUpCallbacks[event.code].forEach(function (callback) {
                    callback();
                });
            }
        });
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static removeOnKeyDown(keyCode, callback){
        if (Keyboard.keyDownCallbacks[keyCode] === undefined)
            return;

        let index = Keyboard.keyDownCallbacks[keyCode].indexOf(callback);
        Keyboard.keyDownCallbacks[keyCode].splice(index, 1);
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static removeOnKeyUp(keyCode, callback){
        if (Keyboard.keyUpCallbacks[keyCode] === undefined)
            return;

        let index = Keyboard.keyUpCallbacks[keyCode].indexOf(callback);
        Keyboard.keyUpCallbacks[keyCode].splice(index, 1);
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static onKeyDown(keyCode, callback){
        if (Keyboard.keyDownCallbacks[keyCode] === undefined)
            Keyboard.keyDownCallbacks[keyCode] = [];

        Keyboard.keyDownCallbacks[keyCode].push(callback);
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static onKeyUp(keyCode, callback){
        if (Keyboard.keyUpCallbacks[keyCode] === undefined)
            Keyboard.keyUpCallbacks[keyCode] = [];

        Keyboard.keyUpCallbacks[keyCode].push(callback);
    }

}
