import {CollisionComponent, Component, Property} from '@wonderlandengine/api';

export let ufo;

/**
 * UFO-Controller
 */
export class UFOController extends Component {
    static TypeName = 'ufo-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        rotationSpeed: Property.float(1.0),
        targetScale: Property.float(0.244)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        // TODO: Add collision to ufo
        // TODO: On collision with bots

        ufo = this;

        this.beam = this.object.children[0];
        this.beamCollision = this.beam.getComponent(CollisionComponent);
        
        this.currentBeamScale = 1.0;
        this.currentScale = 0.0;
        this.object.setScalingLocal([this.currentScale, this.currentScale, this.currentScale])
    }

    spawn(position) {
        this.object.setTranslationWorld(position)

        this.currentAnim = anime({
            targets: this,
            easing: 'easeOutElastic',
            currentScale: this.targetScale,
            autoplay: false,
            duration: 1100,
            update: (anim) => {
              this.object.setScalingLocal([this.currentScale, this.currentScale, this.currentScale])
            },
            changeComplete: (anim) => {
                this.beamCollision.active = true;
                this.currentAnim = null;
                this.spawnBeam();
            },
        });
    }

    flyAway() {
        this.beamCollision.active = false;
        this.beamScaleAnim = anime({
            targets: this,
            easing: 'easeOutElastic',
            currentBeamScale: 0.0,
            autoplay: false,
            duration: 700,
            update: (anim) => {
              this.object.setScalingLocal([this.currentBeamScale, this.currentBeamScale, this.currentBeamScale])
            },
            changeComplete: (anim) => {
                this.beamScaleAnim = null;
                // TODO: Fly away
            },
        });
    }

    
    spawnBeam() {
        this.beamScaleAnim = anime({
            targets: this,
            easing: 'easeOutElastic',
            currentBeamScale: 1.0,
            autoplay: false,
            duration: 1100,
            update: (anim) => {
              this.object.setScalingLocal([this.currentBeamScale, this.currentBeamScale, this.currentBeamScale])
            },
            changeComplete: (anim) => {
                this.beamScaleAnim = null;
            },
        });
    }

    update(dt) {
        this.object.rotateAxisAngleDegLocal([0, 1, 0], this.rotationSpeed * dt);

        if (this.currentAnim) {
            this.currentAnim.tick(getTime(this.engine));
        }

        if (this.beamScaleAnim) {
            this.beamScaleAnim.tick(getTime(this.engine));
        }
    }
}
