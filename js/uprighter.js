import { Component, Property } from '@wonderlandengine/api';
import { glMatrix, vec3, quat } from 'gl-matrix';

/**
 * uprighter
 */
export class Uprighter extends Component {
    static TypeName = 'uprighter';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.qRot = new Float32Array(4);
    }

    start() {

    }

    update(dt) {
        /* Called every frame. */
        this.object.getRotationWorld(this.qRot);
        this.qRot[0] = 0;
        this.qRot[2] = 0;
        quat.normalize(this.qRot, this.qRot);
        this.object.setRotationWorld(this.qRot);
    }
}
