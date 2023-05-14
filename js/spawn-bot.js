import { Collider, CollisionComponent, Component, MeshComponent, Property } from '@wonderlandengine/api';
import { BotController } from './bot-controller';
import { Uprighter } from './uprighter';
import { CloneParams, ObjectUtils } from 'wle-pp';
import { robotPool } from './robot-pool';
import { HowlerAudioSource } from '@wonderlandengine/components';

export let botSpawner;

const walkAnimObjectNames = ['Main-Parent', 'L-Arm-Parent', 'R-Arm-Parent', 'L-Leg-Parent', 'R-Leg-Parent', 'Antenna'];
const SPAWN_TIME = 1.0;
/**
 * spawnBot
 */
export class SpawnBot extends Component {
    static TypeName = 'spawn-bot';
    static Properties = {
        placementObject: Property.object(),
        portalObject: Property.object(),
    };
    static Dependencies = [];

    init() {
        botSpawner = this;

        if (this.placementObject) {
            this.Placement = this.placementObject.getComponent("portal-placement-marker")
        }
        // this.spawnAudio = this.portalObject.getComponent(HowlerAudioSource);

        this.enabled = false;
        this.spawnActive = false;
        this.vTemp1 = new Float32Array(3);
        this.spawnTransform = new Float32Array(8);
        this.qTemp1 = new Float32Array(4);
    }

    start() {
    }

    startSpawn() {
        this.spawn();
        this.enabled = true;
        this.spawnActive = true;
        this.timer = SPAWN_TIME;
    }

    stopSpawn() {
        this.spawnActive = false;
        this.enabled = false;
        this.active = false;

    }

    update(dt) {
        /* Called every frame. */
        if (this.Placement) {
            let placementActive = !this.Placement.active;
            if (placementActive != this.enabled) {
                console.debug("Spawn state change" + this.enabled)
                if (this.enabled) this.stopSpawn();
                else if (!this.enabled) {

                    if (this.portalObject) {
                        this.portalObject.getTransformWorld(this.spawnTransform);
                        this.object.setTransformWorld(this.spawnTransform);
                        this.object.rotateAxisAngleDegObject([0, 1, 0], 180);
                    }
                    this.startSpawn();
                }
            }
        }

        if(this.spawnActive) {
            this.timer -=dt;
            if(this.timer <= 0.0) {
                this.timer = SPAWN_TIME;
                this.spawn();
            }
        }

    }

    spawn() {
        // let cloneParams = new CloneParams();
        // cloneParams.myUseDefaultComponentCloneAsFallback = true;

        // const o = ObjectUtils.clone(this.robotObject, cloneParams);
        // o.parent = this.object;
        // const animComponent = ObjectUtils.getComponent(o, 'animation');
        
        // let retargetObjects = [];
        
        // for (let i = 0; i < walkAnimObjectNames.length; i++) {
        //     const name = walkAnimObjectNames[i];
        //     retargetObjects.push(ObjectUtils.getObjectByName(o, name));
        // }
        
        // animComponent.animation = animComponent.animation.retarget(retargetObjects);
        // animComponent.play();

        // this.spawnAudio.play();
        const bot = robotPool.getEntity();
        bot.object.setTransformWorld(this.spawnTransform);
        // this.object.getRotationWorld(this.qTemp1);
        // this.portalObject.getTransformWorld(this.qTemp1);
    }
}
