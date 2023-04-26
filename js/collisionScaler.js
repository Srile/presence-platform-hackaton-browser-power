import { Component, Property } from '@wonderlandengine/api';
import { vec3 } from 'gl-matrix';
/**
 * collisionScaler
 */
export class CollisionScaler extends Component {
    static TypeName = 'collisionScaler';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        console.log('init() with param', this.param);
        this.vTemp1 = new Float32Array(3);
    }

    start() {
        console.log('start() with param', this.param);
        let vScale = new Float32Array(3);
        this.object.getScalingLocal(vScale);
        let sc = (vScale[0] + vScale[1] + vScale[2]) / 3;

        this.scaleCollider(this.object, sc);
    }

    scaleCollider(obj, sc) {
        let allcomps = obj.getComponents();

        allcomps.forEach((c) => {
            console.debug("comp:" + c.type)
            if (c.type == "collision") {
                vec3.scale(this.vTemp1, c.extents, sc);
                vec3.copy(c.extents, this.vTemp1);
                console.debug(c.extents);
            }
        })

        obj.children.forEach((C) => {
            this.scaleCollider(C, sc);
        })
    }

    showCollider(obj) {
        console.debug(obj.name);
        let allcomps = obj.getComponents();

        allcomps.forEach((c) => {
            console.debug("comp:" + c.type)
            if (c.type == "collision") {
                console.dir(c);
            }
        })

        obj.children.forEach((C) => {
            this.showCollider(C);
        })
    }
    update(dt) {
        /* Called every frame. */
    }
}
