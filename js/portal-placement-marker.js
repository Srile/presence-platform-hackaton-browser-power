import {Component, Property} from '@wonderlandengine/api';
import { lookAt } from './place-portal';
import { Cursor } from '@wonderlandengine/components';

let tempQuat = new Float32Array(4)
let tempVec2 = new Float32Array(3)

export let portalPlacementMarkers = {}

/**
 * portal-placement-marker
 */
export class PortalPlacementMarker extends Component {
    static TypeName = 'portal-placement-marker';
    /* Properties that are configurable in the editor */
    static Properties = {
        camera: Property.object(),
        cursor: Property.object(),
        handedness: Property.string('right')
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        window.pp = this;
        portalPlacementMarkers[this.handedness] = this;
        this.cursorComponent = this.cursor.getComponent(Cursor);
    }

    setActive(b) {
        this.object.active = b;
        this.object.children[0].active = b;
    }

    update(dt) {
        this.camera.getTranslationWorld(tempVec2);

        lookAt(tempQuat, this.cursorComponent.cursorPos, tempVec2);

        this.object.setRotationWorld(tempQuat);
    }
}
