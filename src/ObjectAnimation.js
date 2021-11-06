import {AnimationMixer} from "./Vendor/three.module.js";


export default class ObjectAnimation{
    constructor(model){
        this.model = model;
        this._mixer = new AnimationMixer(model);
    }

    playClip( clip ){
        console.log("PLAY", clip, this.model);
        this.stop();
        this._mixer.timeScale = 1;
        this._mixer.clipAction( clip ).play();

    }
    //
    // play( animationName, animationBlock){
    //     let clip = this.level._storage.ifp.find(animationBlock, animationName);
    //     this.playClip(clip);
    // }

    stop(){
        this._mixer.stopAllAction();
    }

    pause(){
        this._mixer.timeScale = 0;
    }

    update(delta) {
        this._mixer.update( delta );
    }
}

