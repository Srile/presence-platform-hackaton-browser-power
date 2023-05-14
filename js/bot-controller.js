import { Collider, CollisionComponent, Component, Physics, Property } from '@wonderlandengine/api';
import { glMatrix, vec3, quat } from 'gl-matrix';
import { ufo } from './ufo-controller';
import { ObjectPool, ObjectUtils } from 'wle-pp';
import { robotPool } from './robot-pool';
import { alignToGrid, checkCollisionUFO, checkCollisionWalking } from './object-placer';

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
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

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
        
        let isCollisionBelow = checkCollisionWalking(_tempVecInt);
        this.object.translateObject([0, isCollisionBelow ? 0 : -0.98 * dt, this.speed * dt]);
    }
}

let forwardTemp = new Float32Array(3);
let temp = new Float32Array(3);
let dotTemp = 0;

let vector = new Float32Array(3);
let vector2 = new Float32Array(3);
let vector3 = new Float32Array(3);

function LookAt(quaternion, sourcePoint, destPoint, up) {
    if (!up) {
        up = [0, 1, 0];
    }

    vec3.sub(forwardTemp, destPoint, sourcePoint);
    vec3.normalize(forwardTemp, forwardTemp);

    dotTemp = vec3.dot(up, forwardTemp);

    vec3.scale(temp, forwardTemp, dotTemp);
    vec3.sub(up, up, temp);
    vec3.normalize(up, up);
    vec3.normalize(vector, forwardTemp);
    vec3.cross(vector2, up, vector);
    vec3.cross(vector3, vector, vector2);
    let m00 = vector2[0];
    let m01 = vector2[1];
    let m02 = vector2[2];
    let m10 = vector3[0];
    let m11 = vector3[1];
    let m12 = vector3[2];
    let m20 = vector[0];
    let m21 = vector[1];
    let m22 = vector[2];


    let num8 = (m00 + m11) + m22;
    if (num8 > 0.0) {
        let num = Math.sqrt(num8 + 1.0);
        quaternion[3] = num * 0.5;
        num = 0.5 / num;
        quaternion[0] = (m12 - m21) * num;
        quaternion[1] = (m20 - m02) * num;
        quaternion[2] = (m01 - m10) * num;
        return quaternion;
    }
    if ((m00 >= m11) && (m00 >= m22)) {
        let num7 = Math.sqrt(((1.0 + m00) - m11) - m22);
        let num4 = 0.5 / num7;
        quaternion[0] = 0.5 * num7;
        quaternion[1] = (m01 + m10) * num4;
        quaternion[2] = (m02 + m20) * num4;
        quaternion[3] = (m12 - m21) * num4;
        return quaternion;
    }
    if (m11 > m22) {
        let num6 = Math.sqrt(((1.0 + m11) - m00) - m22);
        let num3 = 0.5 / num6;
        quaternion[0] = (m10 + m01) * num3;
        quaternion[1] = 0.5 * num6;
        quaternion[2] = (m21 + m12) * num3;
        quaternion[3] = (m20 - m02) * num3;
        return quaternion;
    }
    let num5 = Math.sqrt(((1.0 + m22) - m00) - m11);
    let num2 = 0.5 / num5;
    quaternion[0] = (m20 + m02) * num2;
    quaternion[1] = (m21 + m12) * num2;
    quaternion[2] = 0.5 * num5;
    quaternion[3] = (m01 - m10) * num2;


    return quaternion;
}