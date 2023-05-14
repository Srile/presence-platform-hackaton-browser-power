import { Collider, CollisionComponent, Component, MeshComponent, Property } from '@wonderlandengine/api';
import { vec3 } from 'gl-matrix';
import { TILE_WIDTH, currentLevelPlacements } from './game-manager';
import { HowlerAudioSource } from '@wonderlandengine/components';
import { BLOCK_TYPES, blockDataContainer } from './block-data-container';

let currentObjects = [];

let selectedBlockType = BLOCK_TYPES.normal;

export function setSelectedBlockType(type) {
    selectedBlockType = type;
}

export let objectPlacers = {}
export let blockSpace;
    
export let MULTIPLIER = 1;
/**
 * object-placer
 */
export class ObjectPlacer extends Component {
    static TypeName = 'object-placer';
    /* Properties that are configurable in the editor */
    static Properties = {
        gridIncrementSteps: Property.float(0.5),
        handedness: Property.string("left"),
        meshCube: Property.mesh(),
        disallowedMaterial: Property.material(),
        blockSpace: Property.object()
    };

    _tempVec = new Float32Array(3);
    _tempVecInt = new Int32Array(3);
    _zeros = 0;
    _boxExtents = [0.095, 0.095, 0.095];

    _onDeactivateCallbacks = [];
    _onActivateCallbacks = [];

    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        if(!blockSpace) blockSpace = this.blockSpace;
        objectPlacers[this.handedness] = this;

        this.placeAudio = this.object.getComponent(HowlerAudioSource);

        let str = this.gridIncrementSteps.toFixed(20);  // Set the number of digits to a large value

        // Loop through the string representation of the number

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

        MULTIPLIER = 10 * this._zeros;
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
            // Create Cube
            this.currentCube = this.engine.scene.addObject(this.blockSpace);
            this.currentCube.setScalingLocal(this._boxExtents);

            this.currentCube.meshComponent = this.currentCube.addComponent(MeshComponent, {
                material: this.disallowedMaterial,
                mesh: blockDataContainer.getMesh(selectedBlockType),
            });

            this._placementAllowed = false;
            this._isDown = true;
        }
    }

    /** 'selectend' event listener */
    onSelectEnd(e) {
        if (e.inputSource.handedness == this.handedness) {
            this._isDown = false;

            if (this._placementAllowed) {
                currentObjects.push(this.currentCube);
                currentLevelPlacements.set(this._tempVecInt.toString(), 'block');
                this.placeAudio.play();
            } 
            else this.currentCube.active = false;
        }
    }

    update(dt) {
        if (this._isDown) {
            this.object.getPositionWorld(this._tempVec);
            alignToGrid(this._tempVec, this._tempVecInt);
            this.currentCube.setPositionLocal(this._tempVec);

            const overlaps = checkCollision(this._tempVecInt);
            // const overlaps = this.currentCube.collisionComponent.queryOverlaps();

            if (overlaps && this._placementAllowed) {
                this.currentCube.meshComponent.material = this.disallowedMaterial;
                this._placementAllowed = false;
            } else if (!overlaps && !this._placementAllowed) {
                this.currentCube.meshComponent.material = blockDataContainer.getMaterial(selectedBlockType);
                this._placementAllowed = true;
            }
        }
        /* Called every frame. */
    }
}

let tempVecInt = new Int32Array(3);

export function checkCollision(position) {
    for (let x = -1; x < TILE_WIDTH; x++) {
        for (let y = -1; y < TILE_WIDTH; y++) {
            for (let z = -1; z < TILE_WIDTH; z++) {
                tempVecInt.set(position);
                tempVecInt[0] += x;
                tempVecInt[1] += y;
                tempVecInt[2] += z;
                if(currentLevelPlacements.get(tempVecInt.toString())) return true;
            } 
        }               
    }
    return false;
}

export function checkCollisionZ(position, lookIsPositive) {
    tempVecInt.set(position);
    tempVecInt[2] += lookIsPositive ? 1 : -1;
    if(currentLevelPlacements.get(tempVecInt.toString())) return true;
    return false;
}

export function checkCollisionX(position, lookIsPositive) {
    tempVecInt.set(position);
    tempVecInt[0] += lookIsPositive ? 1 : -1;
    if(currentLevelPlacements.get(tempVecInt.toString())) return true;
    return false;
}

export function checkCollisionY(position, lookIsPositive) {
    tempVecInt.set(position);
    tempVecInt[1] += lookIsPositive ? 1 : -1;
    if(currentLevelPlacements.get(tempVecInt.toString())) return true;
    return false;
}

export function checkCollisionWalking(position) {
    tempVecInt.set(position);

    for (let z = 0; z < TILE_WIDTH + 1; z++) {
        tempVecInt.set(position);
        tempVecInt[1] -= 1;
        tempVecInt[2] += z;
        if(currentLevelPlacements.get(tempVecInt.toString()) === 'block') return true;
    }
    return false;
}

export function checkCollisionUFO(position) {
    if(currentLevelPlacements.get(position.toString()) === 'ufo') return true;
    return false;
}

export function alignToGrid(vector, vecInt) {
    blockSpace.transformPointInverseWorld(vector);

    vec3.scale(vector, vector, MULTIPLIER);
    vec3.round(vector, vector);
    if(vecInt) {
        vecInt[0] = Math.round(vector[0])
        vecInt[1] = Math.round(vector[1])
        vecInt[2] = Math.round(vector[2])
    }
    vec3.scale(vector, vector, 1.0 / MULTIPLIER);
}