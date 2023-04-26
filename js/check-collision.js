import {Component, Property, Type} from '@wonderlandengine/api';

/**
 * check-collision
 */
export class CheckCollision extends Component {
    static TypeName = 'check-collision';
    /* Properties that are configurable in the editor */
    static Properties = {
        selectionColor: { type: Type.Color, default: [0.0, 1.0, 0.0, 1.0] },
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.isColliding = false;
        this.didCollide = false;
        this.currentMesh = this.object.getComponent('mesh', 0);
        this.currentMaterial = this.currentMesh.material;
        this.meshColor = new Float32Array(this.currentMaterial.diffuseColor);
        this.activeColor = this.selectionColor;

        this.collisionComponent = this.object.getComponent('collision', 0);
    }

    start() {
        console.log('start() with param', this.param);
    }

    onCollisionEnter() {
        if (this.didCollide) return;
        console.log("onCollisionEnter")
        this.didCollide = true;
        this.currentMaterial.diffuseColor = this.activeColor;
    }

    onCollision() {
        this.isColliding = true;
        this.onCollisionEnter();
    }

    onCollisionLeft() {
        if (!this.isColliding) return;
        console.log("onCollisionLeft")
        this.isColliding = false;
        this.didCollide = false;

        this.currentMaterial.diffuseColor = this.meshColor;
    }

    update(dt) {
        /* Called every frame. */
        const overlaps = this.collisionComponent.queryOverlaps();

        if(overlaps.length) {
            this.onCollision()
        } else if(!overlaps.length){
            this.onCollisionLeft()
        }
    }
}
