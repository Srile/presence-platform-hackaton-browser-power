import { Collider, CollisionComponent, Component, MeshComponent, Property } from '@wonderlandengine/api';
import { vec3, quat } from 'gl-matrix';

let currentObjects = [];

export let objectRotates = {}

/**
 * object-rotate
 */
export class ObjectRotate extends Component {
    static TypeName = 'object-rotate';
    /* Properties that are configurable in the editor */
    static Properties = {
        gridIncrementSteps: Property.float(0.5),
        handedness: Property.string("left"),
        meshCube: Property.mesh(),
        allowedMaterial: Property.material(),
        disallowedMaterial: Property.material(),
        blockSpace: Property.object()
    };

    _tempVec = new Float32Array(3);
    _zeros = 0;
    _multiplier = 1;
    _boxExtents = [0.095, 0.095, 0.095];

    _onDeactivateCallbacks = [];
    _onActivateCallbacks = [];

    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        this._qTemp = new Float32Array(4);
        this._q90Temp = new Float32Array(4);
        objectRotates[this.handedness] = this;

        let str = this.gridIncrementSteps.toFixed(20);  // Set the number of digits to a large value

        // Loop through the string representation of the number
        
        this.positionDummy = this.engine.scene.addObject(this.blockSpace);
        this.collisionComponent = this.object.getComponent('collision', 0);

        this._onSessionStartCallback = this.setupVREvents.bind(this);
        // this.engine.onXRSessionStart.add(this._onSessionStartCallback);

        // TODO: Might need to ignore the first zero, 0.xxx
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '0') {
                this._zeros++;  // Increment the count of zeros
            } else {
                break;  // Stop counting zeros when a non-zero digit is encountered
            }
        }

        this._multiplier = 10 * this._zeros;


    }

    setupVREvents(s) {
        if (!s) console.error('setupVREvents called without a valid session');

        /* If in VR, one-time bind the listener */
        // const onSelect = this.onSelect.bind(this);
        // s.addEventListener('select', onSelect);
        const onSelectStart = this.onSelectStart.bind(this);
        s.addEventListener('selectstart', onSelectStart);
        const onSelectEnd = this.onSelectEnd.bind(this);
        s.addEventListener('selectend', onSelectEnd);

        this._onDeactivateCallbacks.push(() => {
            if (!this.engine.xrSession) return;
            // s.removeEventListener('select', onSelect);
            s.removeEventListener('selectstart', onSelectStart);
            s.removeEventListener('selectend', onSelectEnd);
        });
    }

    setActive(b) {
        if (b) {
            this.engine.onXRSessionStart.add(this._onSessionStartCallback);

            /* Ensure all event listeners are removed */
            for (const f of this._onActivateCallbacks) f();
        } else {
            this.engine.onXRSessionStart.remove(this._onSessionStartCallback);

            /* Ensure all event listeners are removed */
            for (const f of this._onDeactivateCallbacks) f();
        }
    }

    /** 'selectstart' event listener */
    onSelectStart(e) {
        if (e.inputSource.handedness == this.handedness) {
            const overlaps = this.collisionComponent.queryOverlaps();

            for(const otherCollision of overlaps) {
                const otherObject = otherCollision.object;

                otherObject.getRotationWorld(this._qTemp);

                quat.fromEuler(this._q90Temp, 0, 90, 0);
                quat.multiply(this._qTemp, this._qTemp, this._q90Temp);

                otherObject.setRotationWorld(this._qTemp);

                console.log(`Collision with object ${otherObject.objectId}`);
            }
        }
    }

    /** 'selectend' event listener */
    onSelectEnd(e) {
        if (e.inputSource.handedness == this.handedness) {}
    }

    update(dt) {
    }
}
