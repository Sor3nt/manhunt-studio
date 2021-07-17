export default class Helper{

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
            console.error((msg || ('Expect ' + b + ' got ' + a)) );
            debugger;
        }
    }



}