import { Component, Physics, Property } from '@wonderlandengine/api';
import { glMatrix, vec3, quat } from 'gl-matrix';

/**
 * botcontroller
 */
export class Botcontroller extends Component {
    static TypeName = 'botcontroller';
    /* Properties that are configurable in the editor */
    static Properties = {
        speed: Property.float(0.5),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.qTemp1 = new Float32Array(4);
        this.qTemp2 = new Float32Array(4);
        this.vTemp1 = new Float32Array(3);
        this.vTemp2 = new Float32Array(3);
        this.vTemp3 = new Float32Array(3);
        this.vDest = new Float32Array(3);
        this.originVec = new Float32Array(3); // Fill with a point
        this.forwardVec = new Float32Array(3); // Fill with a point
        this.directionVec = [0, -1, 0]; // Fill with normalized direction vector
        this.mode = 0;
        this.qDestinationRotation = new Float32Array(4);
        this.lasthitobject = null;
        this.fallspeed = 0;
        this.grav = 1;
        this.fly = false;
    }

    start() {
        //setInterval(()=>{this.resetRotation()}, 1000);
        let scTemp = [1, 1, 1]
        this.object.getScalingWorld(scTemp);
        console.debug("SCALE:" + scTemp)
        this.worlscalar = 1;//(scTemp[0] + scTemp[1] + scTemp[2] / 3);
    }

    snap(v) {
        const step = 10;
        //v = Math.round((v * step) + 1) / step;
        return v;
    }

    setDestinationVec(V3) {

        this.vDest[0] = this.snap(V3[0]);
        this.vDest[1] = this.snap(V3[1]);
        this.vDest[2] = this.snap(V3[2]);
        //
        this.object.getTranslationWorld(this.vTemp3)
        LookAt(this.qTemp1, this.vDest, this.originVec, [0, 1, 0])
        quat.normalize(this.qTemp1, this.qTemp1)
        this.object.setRotationWorld(this.qTemp1)
    }
    setDestination(x, y, z) {
        this.setDestinationVec([x, y, z])
    }

    resetRotation() {
        this.setDestination((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }

    update(dt) {
        /* Called every frame. */
        this.object.translateObject([0, 0, -this.speed * dt]);
        this.object.translateWorld([0, this.fallspeed * dt, 0]);
        this.object.getTranslationWorld(this.originVec);
        this.object.getForwardWorld(this.forwardVec);
        const mask = (1 << 3); // Only these objects will be ray-cast against


        // Mode 0 is no destination found
        // try to find a destination
        if (this.mode == 0) {

            // Assuming PathTile collision group is 3
            this.forwardVec[0] = 0;
            this.forwardVec[2] = 0;
            vec3.normalize(this.forwardVec, this.forwardVec);

            vec3.scale(this.forwardVec, this.forwardVec, 0.1 * this.worlscalar);
            vec3.add(this.vTemp3, this.originVec, this.forwardVec);
            vec3.add(this.vTemp3, this.vTemp3, [0, 0.05 * this.worlscalar, 0]);
            vec3.normalize(this.directionVec, this.directionVec);
            const hit = this.engine.scene.rayCast(this.vTemp3, this.directionVec, mask);

            if (hit.hitCount > 0) {
                let hitObject = null;
                let hitdist = 0.1 * this.worlscalar;
                let hiti = -1;
                if (this.fly) hitdist = 0.05
                for (let i = 0; i < hit.hitCount; i++) {
                    if (hit.objects[i] != this.lasthitobject) {
                        let testobject = hit.objects[i];
                        testobject.getTranslationWorld(this.vTemp1);
                        let testDist = vec3.dist(this.vTemp3, this.originVec);
                        if (testDist < hitdist) {
                            hitdist = testDist;
                            hitObject = hit.objects[i];
                            hiti = i;
                        }
                    }
                }
                if (hitObject) {
                    ///console.debug(hitObject.name, this.originVec, hit)
                    this.mode = 1;

                    hitObject.getTranslationWorld(this.vTemp2)

                    this.vTemp2[1] += 0.3 * this.worlscalar;
                    this.setDestinationVec(this.vTemp2);
                    //this.setDestinationVec(hit.locations[hiti]);
                    hitObject.getRotationWorld(this.qTemp2);
                    quat.copy(this.qDestinationRotation, this.qTemp2);
                    this.lasthitobject = hitObject;
                    this.fallspeed = 0;
                    this.fly = false;
                }


            }
            else {  // no hit
                const hit2 = this.engine.scene.rayCast(this.originVec, this.directionVec, mask);
                let anyHit = true;
                if (hit2.hitcount == 0) {
                    anyHit = false
                } else {
                    let mindist = 100;
                    for (let i = 0; i < hit2.hitcount; i++) {
                        if (hit2.distances[i] < mindist) mindist = hit2.distances[i];
                    }
                    if (mindist > (0.05 * this.worlscalar)) anyHit = false;
                }

                if (!anyHit) {

                    this.fallspeed -= this.grav * dt;
                }
                //hit.locations[0], hit.objects[0], ...; // contains first hit, up to 4 hits max

            }
            // if flying keeping falling


            //this.object.translateObject([0, this.fallspeed, 0]);
        } else if (this.mode == 1) {
            // destination found move towards destination
            let destDistance = vec3.distance(this.originVec, this.vDest);

            if (destDistance < (0.01 * this.worlscalar)) {
                this.mode = 0;
                this.object.setTranslationWorld(this.vDest);
                let destName = this.lasthitobject.name;
                ///console.log("DESTNAME=" + destName);
                let doTurn = (destName.indexOf("TURN") > -1);
                let doBounce = (destName.indexOf("BOUNCE") > -1);
                if ((doTurn) || (doBounce)) {
                    this.object.setRotationWorld(this.qDestinationRotation);
                    if (doBounce) {
                        this.fallspeed = 2.5 * this.worlscalar;
                        this.fly = true;
                        this.flyfloor = 0;//this.originVec[1];
                    }
                }
                else {
                    //quat.copy(this.qTemp1, this.qDestinationRotation);
                    this.object.getRotationWorld(this.qTemp1);
                    this.qTemp1[0] = 0;
                    this.qTemp1[2] = 0;
                    quat.normalize(this.qTemp1, this.qTemp1)
                    this.object.setRotationWorld(this.qTemp1);
                }
                this.object.getForwardWorld(this.forwardVec)
                //this.directionVec[1] -= 0.2;

            } else {

            }
        }

        if (this.fly) {
            this.fallspeed -= ((this.grav / 1) * dt);
            const maxFallSpeed = -8;
            if (this.fallspeed < maxFallSpeed) this.fallspeed = maxFallSpeed
            // console.log(this.fallspeed);
            const hit2 = this.engine.scene.rayCast(this.originVec, this.directionVec, mask);
            let anyHit = true;
            if (hit2.hitcount == 0) {
                anyHit = false
            } else {
                let mindist = 100;
                for (let i = 0; i < hit2.hitcount; i++) {
                    if (hit2.distances[i] < mindist) mindist = hit2.distances[i];
                }
                if (mindist > 0.005) anyHit = false;
            }

            if ((anyHit) || (this.originVec[1] < this.flyfloor)) {
                this.fallspeed = 0;
                this.fly = false
            }
        }
    }

    //this.originVec[1] += 0.1
    //this.object.rotateAxisAngleDegObject([0,1,0], dt*45);


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