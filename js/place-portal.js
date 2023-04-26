import { Component, MeshComponent, Property } from "@wonderlandengine/api";
import { Cursor } from "@wonderlandengine/components";
import { Anchor } from "@wonderlandengine/components";
import { vec3 } from "gl-matrix";

import anime from 'animejs/lib/anime.es.js';
import { portalPlacementMarkers } from "./portal-placement-marker";

export let portalPlacement;

export function getTime(engine) {
  const frame = engine.xrFrame;
  return (frame && frame.predictedDisplayTime) || performance.now() || Date.now();
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const tempQuat2 = new Float32Array(8);

let spawnedPortal = false;

/**
 * place-shape-anchor
 */
export class PlacePortal extends Component {
  static TypeName = "place-portal";
  static Properties = {
    portalObject: Property.object(),
    targetScale: Property.float(0.166),
  };
  static Dependencies = [Anchor];

  start() {
    this.activated = false;

    portalPlacement = this;

    this.onSpawnCompleteCallbacks = [];

    this.currentScale = 0.0;

    this.portalObject.setScalingLocal([this.currentScale, this.currentScale, this.currentScale])

    this.tempVec = new Float32Array(3);
    this.tempVec2 = new Float32Array(3);
    this.cursor = this.object.getComponent(Cursor);
    this.cursor.hitTestTarget.onClick.add((result, _, event) => {
      if(!this.activated) return;
      if(!spawnedPortal) this.spawnPortal(null, event.frame ?? null, result, this.portalObject);
    });
    this.cursor.globalTarget.onClick.add((clickedObject, _, event) => {
      if(!this.activated) return;
      if(!spawnedPortal) this.spawnPortal(null, event.frame ?? null, null, this.portalObject, clickedObject);
    });

    this.engine.onXRSessionStart.add((s) => {
      for (const uuid of this.engine.xrSession.persistentAnchors) {
        this.engine.xrSession
          .deletePersistentAnchor(uuid)
          .then(() => console.log("deleting old anchor", uuid))
          .catch(console.error);
      }

      const uuidList = getCookie("persistent-anchors").split(",");

      /* Restore all known anchors */
      for (const uuid of uuidList) {
        console.log('p', this.engine.xrSession.persistentAnchors);
        if (!(uuid in this.engine.xrSession.persistentAnchors)) continue;
        this.spawnPortal(uuid, null, null, portalObject);
      }
    });
  }

  activate() {
    this.activated = true;
    portalPlacementMarkers.right.setActive(true);
  }

  addOnSpawnCompleteFunction(f) {
    this.onSpawnCompleteCallbacks.push(f);
  }

  spawnPortal(
    uuid = null,
    frame = this.engine.xr?.frame,
    hitResult = null,
    portalObject,
    clickedObject
  ) {
    portalObject.setTranslationWorld(this.cursor.cursorObject.getTranslationWorld(tempQuat2));
    if(clickedObject) {
      clickedObject.getTranslationWorld(this.tempVec);
      clickedObject.getUp(this.tempVec2);
      vec3.negate(this.tempVec2, this.tempVec2);

      vec3.add(this.tempVec2, this.tempVec, this.tempVec2);

      lookAt(tempQuat2, this.tempVec, this.tempVec2);
      portalObject.setRotationWorld(tempQuat2);
    }

    portalPlacementMarkers.right.setActive(false);

    this.currentAnim = anime({
        targets: this,
        easing: 'easeOutElastic',
        currentScale: this.targetScale,
        autoplay: false,
        duration: 1500,
        update: (anim) => {
          this.portalObject.setScalingLocal([this.currentScale, this.currentScale, this.currentScale])
        },
        changeComplete: (anim) => {
          this.onSpawnCompleteCallbacks.forEach((f) => f());
          this.currentAnim = null;
        },
    });
    
    spawnedPortal = true;

    Anchor.create(portalObject, { persist: false, uuid: uuid }, frame, hitResult).then(
      (a) => {
        /* Hide and show mesh if tracking is lost/restored */
        a.onTrackingLost.add(() => ((m.active = false), console.log("lost")));
        a.onTrackingFound.add(() => ((m.active = true), console.log("found")));

        const uuidList = Anchor.getAllAnchors()
          .filter((a) => a.persist)
          .map((a) => a.uuid)
          .join(",");

        setCookie("persistent-anchors", uuidList, 356);
      }
    );
  }

  update(dt) {
    if (this.currentAnim) {
      this.currentAnim.tick(getTime(this.engine));
    }
  }
}


let forwardTemp = new Float32Array(3);
let temp = new Float32Array(3);
let dotTemp = 0;

let vector = new Float32Array(3);
let vector2 = new Float32Array(3);
let vector3 = new Float32Array(3);

export function lookAt(quaternion, sourcePoint, destPoint, up) {
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