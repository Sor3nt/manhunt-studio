export default class Helper{

    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '0x';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return eval(color);
    }

    static assert(a, b, msg){

        if(b === undefined){
            if (a === false){
                console.error("Assert failed");
                debugger;
                return;
            }
            return;
        }

        if (a !== b){
            // console.error((msg || ('Expect ' + b + ' got ' + a)) );
            // debugger;
        }
    }



}