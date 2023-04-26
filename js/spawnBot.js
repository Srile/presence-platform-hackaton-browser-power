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
        interval: Property.float(1.0),
        spawnmesh: Property.mesh(),
        spawnmesh2: Property.mesh(),
        spawnmat: Property.material(),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [Botcontroller, Uprighter];

    init() {
        this.qTemp1 = new Float32Array(4);
    }

    start() {
        this.SpawnTicker = setInterval(() => { this.spawn() }, this.interval);


    }

    update(dt) {
        /* Called every frame. */
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
