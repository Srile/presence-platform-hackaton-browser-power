import {Component, Property} from '@wonderlandengine/api';
import { lookAt } from './place-portal';

let tempQuat = new Float32Array(4)
let tempVec = new Float32Array(3)
let tempVec2 = new Float32Array(3)

/**
 * portal-placement-marker
 */
export class PortalPlacementMarker extends Component {
    static TypeName = 'portal-placement-marker';
    /* Properties that are configurable in the editor */
    static Properties = {
        camera: Property.object()
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    setActive(b) {
        this.object.active = b;
        this.object.children[0].active = b;
    }

    update(dt) {
        this.object.getTranslationWorld(this.tempVec);
        // this.camera.getTranslationWorld(this.tempVec2);

        // lookAt(tempQuat, tempVec, tempVec2);



        // this.object.setRotationWorld(tempQuat);
    
        this.object.getTranslationWorld(this.tempVec);
        console.log('tt', tempVec);
    
    }
}
