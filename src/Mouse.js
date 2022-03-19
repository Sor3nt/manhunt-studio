import WebGL from "./WebGL.js";

export default class Mouse{
    static keyDownCallbacks = {};
    static keyUpCallbacks = {};
    static moveCallbacks = [];
    static clickCallbacks = [];
    static keyStates = {
        left: false
    };

    static setup(){
        WebGL.renderer.domElement.addEventListener('mousedown', function(event){
            switch (event.which) {
                case 1:
                    Mouse.keyStates.left = true;

                    if (Mouse.keyDownCallbacks.left !== undefined){
                        Mouse.keyDownCallbacks.left.forEach(function (callback) {
                            callback();
                        });
                    }
                    break;
            }
        });

        WebGL.renderer.domElement.addEventListener('mouseup', function(event){
            switch (event.which) {
                case 1:
                    Mouse.keyStates.left = false;

                    if (Mouse.keyUpCallbacks.left !== undefined){
                        Mouse.keyUpCallbacks.left.forEach(function (callback) {
                            callback();
                        });
                    }
                    break;
            }
        });

        document.body.addEventListener('mousemove', function (event) {
            Mouse.moveCallbacks.forEach(function (callback) {
                callback(event);
            });
        });

        document.body.addEventListener('click', function (event) {
            Mouse.clickCallbacks.forEach(function (callback) {
                callback(event);
            });
        });

    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static removeOnMouseDown(keyCode, callback){
        if (Mouse.keyDownCallbacks[keyCode] === undefined)
            return;

        let index = Mouse.keyDownCallbacks[keyCode].indexOf(callback);
        Mouse.keyDownCallbacks[keyCode].splice(index, 1);
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static removeOnMouseUp(keyCode, callback){
        if (Mouse.keyUpCallbacks[keyCode] === undefined)
            return;

        let index = Mouse.keyUpCallbacks[keyCode].indexOf(callback);
        Mouse.keyUpCallbacks[keyCode].splice(index, 1);
    }


    /**
     *
     * @param callback {function}
     */
    static removeOnMouseMove(callback){
        let index = Mouse.moveCallbacks.indexOf(callback);
        Mouse.moveCallbacks.splice(index, 1);
    }

    /**
     *
     * @param callback {function}
     */
    static removeOnMouseClick(callback){
        let index = Mouse.clickCallbacks.indexOf(callback);
        Mouse.clickCallbacks.splice(index, 1);
    }


    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static onMouseDown(keyCode, callback){
        if (Mouse.keyDownCallbacks[keyCode] === undefined)
            Mouse.keyDownCallbacks[keyCode] = [];

        Mouse.keyDownCallbacks[keyCode].push(callback);
    }

    /**
     *
     * @param keyCode {string}
     * @param callback {function}
     */
    static onMouseUp(keyCode, callback){
        if (Mouse.keyUpCallbacks[keyCode] === undefined)
            Mouse.keyUpCallbacks[keyCode] = [];

        Mouse.keyUpCallbacks[keyCode].push(callback);
    }

    /**
     *
     * @param callback {function}
     */
    static onMouseMove(callback){
        Mouse.moveCallbacks.push(callback);
    }

    /**
     *
     * @param callback {function}
     */
    static onMouseClick(callback){
        Mouse.clickCallbacks.push(callback);
    }

}
