
import Layout from "./Layout.js";
import {AnimationClip} from "./Vendor/three.module.js";
import ObjectAnimation from "./ObjectAnimation.js";


export default class Animations{
    
    active = [];

    /**
     *
     * @param mesh {Group}
     * @param clip {AnimationClip}
     */
    play(mesh, clip) {

        if (this.active[mesh.uuid] === undefined)
            this.active[mesh.uuid] = new ObjectAnimation(mesh);

        this.active[mesh.uuid].playClip(clip);
    }
    
    update(delta){

        for (let i in this.active){
            if (!this.active.hasOwnProperty(i)) continue;
            this.active[i].update(delta);

        }

    }

}