import {Component, MeshComponent, Property} from '@wonderlandengine/api';
import { Botcontroller } from './botcontroller';

/**
 * spawnBot
 */
export class SpawnBot extends Component {
    static TypeName = 'spawnBot';
    /* Properties that are configurable in. the editor */
    static Properties = {
        interval: Property.float(1.0),
        spawnmesh: Property.mesh(),
        spawnmat: Property.material(),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [Botcontroller];

    init() {
    }

    start() {
        this.SpawnTicker = setInterval(()=>{this.spawn()}, this.interval);
    }

    update(dt) {
        /* Called every frame. */
    }

    spawn() {
        const o = this.engine.scene.addObject(this.object);
        o.addComponent(MeshComponent, {
            material: this.spawnmat,
            mesh: this.spawnmesh,
          });
        
          o.addComponent(Botcontroller);
          o.scaleLocal([0.1,0.1,0.1])

    }
}
