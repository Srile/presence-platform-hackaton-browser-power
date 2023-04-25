import {Component, Property} from '@wonderlandengine/api';
import { glMatrix } from 'gl-matrix';

/**
 * rotatedisplay
 */
export class Rotatedisplay extends Component {
    static TypeName = 'display-controller-menu';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        console.log('init() with param', this.param);
        this.qTemp = new Float32Array(4);
        // this.textComponent = this.object.getComponent("text");
        this.planeComponent = this.object.getComponent("mesh");
        
        console.log(this.planeComponent)
        // console.debug(this.qTemp);

        this.planeComponent.active = false;
        setTimeout(() => {
            console.log('===============================')
            this.planeComponent.active = false;
        }, 5000)
    }

    start() {
        console.log('start() with param', this.param);

    }

    update(dt) {
        /* Called every frame. */
        this.object.getRotationWorld(this.qTemp);
        

        // this.textComponent.text = this.qTemp[2].toFixed(2);
        
        
    }
}
