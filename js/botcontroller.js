import {Component, Property} from '@wonderlandengine/api';
import { glMatrix, vec3, quat } from 'gl-matrix';

/**
 * botcontroller
 */
export class Botcontroller extends Component {
    static TypeName = 'botcontroller';
    /* Properties that are configurable in the editor */
    static Properties = {
        speed: Property.float(1.0),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.qTemp1 = new Float32Array(4);
        this.vTemp1 = new Float32Array(3);
        this.vDest = new Float32Array(3);
    }

    start() {
        setInterval(()=>{this.resetRotation()}, 1000);
    }

    setDestination(x,y,z)
    {
        this.vDest[0] = x;
        this.vDest[1] = y;
        this.vDest[2] = z;

        this.object.getTranslationWorld(this.vTemp1)
        lookAt(this.qTemp1, this.vTemp1, this.vDest, [0,1,0])
        quat.normalize(this.qTemp1, this.qTemp1)
        this.object.rotateObject(this.qTemp1)
    }

    resetRotation() {
        this.setDestination((Math.random()-0.5) * 10, (Math.random()-0.5) * 10, (Math.random()-0.5) * 10);
    }

    update(dt) {
        /* Called every frame. */
        this.object.translateObject([0,0,-this.speed * dt]);
        //this.object.rotateAxisAngleDegObject([0,1,0], dt*45);
    }

    
}

let forwardTemp = new Float32Array(3);
let temp = new Float32Array(3);
let dotTemp = 0;

let vector = new Float32Array(3);
let vector2 = new Float32Array(3);
let vector3 = new Float32Array(3);

function lookAt(quaternion, sourcePoint, destPoint, up) {
  if(!up) {
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
  if (num8 > 0.0)
  {
      let num = Math.sqrt(num8 + 1.0);
      quaternion[3] = num * 0.5;
      num = 0.5 / num;
      quaternion[0] = (m12 - m21) * num;
      quaternion[1] = (m20 - m02) * num;
      quaternion[2] = (m01 - m10) * num;
      return quaternion;
  }
  if ((m00 >= m11) && (m00 >= m22))
  {
      let num7 = Math.sqrt(((1.0 + m00) - m11) - m22);
      let num4 = 0.5 / num7;
      quaternion[0] = 0.5 * num7;
      quaternion[1] = (m01 + m10) * num4;
      quaternion[2] = (m02 + m20) * num4;
      quaternion[3] = (m12 - m21) * num4;
      return quaternion;
  }
  if (m11 > m22)
  {
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