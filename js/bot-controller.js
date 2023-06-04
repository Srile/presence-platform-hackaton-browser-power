import { Collider, CollisionComponent, Component, Physics, Property } from '@wonderlandengine/api';
import { glMatrix, vec3, quat } from 'gl-matrix';
import { ufo } from './ufo-controller';
import { ObjectPool, ObjectUtils } from 'wle-pp';
import { robotPool } from './robot-pool';
import { alignToGrid, checkCollisionUFO, checkCollisionWalking, getCurrentBelowBlockObject, getCurrentBelowBlockType } from './object-placer';
import { BLOCK_FUNCTIONS, isBlockSpecial } from './block-data-container';

/**
 * botcontroller
 */

const _tempVecInt = new Int32Array(3);
const zeroScale = [0.0, 0.0, 0.0];

export class BotController extends Component {
    static TypeName = 'bot-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        speed: Property.float(0.5),
        lifetime: Property.float(15.0),
    };

    init() {
        this.vTemp1 = new Float32Array(3); // Fill with a point
        this.vTemp2 = new Float32Array(3); // Fill with a point
        this.originVec = new Float32Array(3); // Fill with a point
        this.originVec = new Float32Array(3); // Fill with a point
        this.forwardVec = new Float32Array(3); // Fill with a point
        this.initialScale = new Float32Array(3);
        this.currentScale = new Float32Array(3);
        this.object.getScalingLocal(this.initialScale);
        this.currentScale.set(this.initialScale);

        this.directionVec = [0, -1, 0]; // Fill with normalized direction vector
        this.mode = 0;
        this.fallspeed = 0;
        this.movementDirection = [0, 0, 1];
        this.grav = 1;
        this.fly = false;
        this.activated = false;
    }

    activate() {
        this.currentScale.set(this.initialScale);
        this.object.setScalingLocal(this.initialScale);
        this.activated = true;
        ObjectUtils.setActiveHierarchy(this.object, true);
        this.timer = this.lifetime;
    }

    deactivate() {
        ObjectUtils.setActiveHierarchy(this.object, false);
        if(this.activated) {
            this.activated = false;
            robotPool.returnEntity(this);
        }
    }

    attractToUFO() {
        this.t = 0.0;
        this.toUFO = true;
    }

    update(dt) {
        if (this.toUFO) {
            ufo.object.getPositionWorld(this.vTemp1);
            
            this.t += dt;
            vec3.lerp(this.vTemp2, this.vTemp2, this.vTemp1, this.t);
            vec3.lerp(this.currentScale, this.initialScale, zeroScale, Math.min(1.0, Math.log(5 * this.t + 1) ));
            
            this.object.setScalingLocal(this.currentScale);
            this.object.setPositionWorld(this.vTemp2);

            if (this.t >= 1) {
                this.deactivate();

                // TODO: ADD ROBOT DEACTIVATE
            }
            return;
        }

        this.timer -= dt;

        if(this.timer <= 0) {
            this.deactivate();
        }

        /* Called every frame. */
        
        this.object.getPositionWorld(this.vTemp2);
        alignToGrid(this.vTemp2, _tempVecInt);

        let isCollisionUFO = checkCollisionUFO(_tempVecInt);

        this.object.getPositionWorld(this.vTemp2);

        if(isCollisionUFO) {
            this.attractToUFO();
            ufo.onRobotCollected();
            return;
        }


        // TODO: Set execution to only happen once per block per bot
        // TODO: 
        const belowBlockType = getCurrentBelowBlockType(_tempVecInt);
        if(isBlockSpecial(belowBlockType)) {
            BLOCK_FUNCTIONS[belowBlockType](getCurrentBelowBlockObject(_tempVecInt), this.object);
        }
        
        let isCollisionBelow = checkCollisionWalking(_tempVecInt);
        this.object.translateObject([0, isCollisionBelow ? 0 : -0.98 * dt, this.speed * dt]);
    }
}