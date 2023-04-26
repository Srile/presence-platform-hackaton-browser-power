import {Component, Property, Type} from '@wonderlandengine/api';
import anime from 'animejs/lib/anime.es.js';

/**
 * check-collision
 */
export class CheckButtonCollision extends Component {
    static TypeName = 'check-button-collision';
    /* Properties that are configurable in the editor */
    static Properties = {
        selectionColor: { type: Type.Color, default: [0.0, 1.0, 0.0, 1.0] },
        id: { type: Type.Int, default: 0 }
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.isColliding = false;
        this.didCollide = false;
        this.currentMesh = this.object.getComponent('mesh', 0);
        this.currentMaterial = this.currentMesh.material;
        this.meshColor = new Float32Array(this.currentMaterial.color);
        this.activeColor = this.selectionColor;
        this.isCurrentlySelected = false;
        this.isUnselecting = false;

        this.collisionComponent = this.object.getComponent('collision', 0);
    }

    start() {}

    onCollisionEnter() {
        if (this.didCollide) return;
        console.log("onCollisionEnter")
        this.didCollide = true;
        this.currentMaterial.color = this.activeColor;
        var currentScale = this.object.getScalingWorld();

        var targets = { x: currentScale[0], y: currentScale[1], z: currentScale[2] };

        anime({
            targets: targets,
            x: 0.04, y: 0.016, z: 0.1,
            easing: 'linear',
            duration: 500,
            autoplay: true,
            update: (e) => {
                this.object.setScalingWorld([targets.x, targets.y, targets.z])
            }
        })
    }

    onCollision() {
        this.isColliding = true;
        this.onCollisionEnter();
    }

    onCollisionLeft() {
        if (!this.isColliding) return;
        console.log("onCollisionLeft")
        window.startExplore()
        this.isColliding = false;
        this.didCollide = false;

        this.currentMaterial.color = this.meshColor;

        var currentScale = this.object.getScalingWorld();

        var targets = { x: currentScale[0], y: currentScale[1], z: currentScale[2] };

        anime({
            targets: targets,
            x: 0.05, y: 0.02, z: 0.1,
            easing: 'linear',
            duration: 500,
            autoplay: true,
            update: (e) => {
                this.object.setScalingWorld([targets.x, targets.y, targets.z])
            }
        })
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
