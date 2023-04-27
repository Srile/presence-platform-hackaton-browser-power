import { Component, MeshComponent, Property } from '@wonderlandengine/api';
import { Botcontroller } from './botcontroller';
import { Uprighter } from './uprighter';

/**
 * spawnBot
 */
export class SpawnBot extends Component {
    static TypeName = 'spawnBot';
    /* Properties that are configurable in. the editor */
    static Properties = {
        placementObject: Property.object(),
        portalObject: Property.object(),
        interval: Property.float(1000.0),
        spawnmesh: Property.mesh(),
        spawnmesh2: Property.mesh(),
        spawnmat: Property.material(),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [Botcontroller, Uprighter];

    init() {
        this.qTemp1 = new Float32Array(4);
        if (this.placementObject) {
            this.Placement = this.placementObject.getComponent("portal-placement-marker")
            console.dir(this.Placement);
        }
        this.enabled = false;
        this.spawnActive = false;
        this.vTemp1 = new Float32Array(3);
        this.dqTemp1 = new Float32Array(8);
        this.qTemp1 = new Float32Array(4);
    }

    start() {
        if (!this.Placement) this.startSpawn();
    }

    startSpawn() {
        this.spawn();
        // this.SpawnTicker = setInterval(() => { this.spawn() }, this.interval);
        this.enabled = true;
        this.spawnActive = true;
        this.timer = 1;
    }

    stopSpawn() {
        this.spawnActive = false;
        // clearInteval(this.SpawnTicker)
        this.enabled = false;

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
                        this.portalObject.getTransformWorld(this.dqTemp1);
                        this.object.setTransformWorld(this.dqTemp1);

                        this.object.rotateAxisAngleDegObject([0, 1, 0], 180);
                    }
                    this.startSpawn();
                }
            }
        }

        if(this.spawnActive) {
            this.timer -=dt;
            if(this.timer <= 0.0) {
                this.timer = 1.0;
                this.spawn();
            }
        }

    }

    spawn() {
        const o = this.engine.scene.addObject(this.object);
        this.object.getRotationWorld(this.qTemp1);
        o.addComponent(MeshComponent, {
            material: this.spawnmat,
            mesh: this.spawnmesh,
        });

        o.addComponent(Botcontroller);
        o.scaleLocal([0.1, 0.02, 0.1])

        const o2 = this.engine.scene.addObject(o);
        o2.addComponent(MeshComponent, {
            material: this.spawnmat,
            mesh: this.spawnmesh2,
        });
        o2.scaleLocal([0.1, 5, 1])
        o2.translateLocal([0, 0, -0.5])
        o2.addComponent(Uprighter);
    }
}
