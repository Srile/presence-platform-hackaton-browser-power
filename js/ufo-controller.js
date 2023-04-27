import {CollisionComponent, Component, Property} from '@wonderlandengine/api';
import anime from 'animejs/lib/anime.es.js';
import { getTime } from './place-portal';
import { Botcontroller } from './botcontroller';

export let ufo;

/**
 * UFO-Controller
 */
export class UFOController extends Component {
    static TypeName = 'ufo-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        rotationSpeed: Property.float(8.0),
        targetScale: Property.float(0.444)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        // TODO: Add collision to ufo
        // TODO: On collision with bots

        window.ufo = this;

        ufo = this;

        this.beam = this.object.children[0];
        this.beamCollision = this.beam.getComponent(CollisionComponent);

        this.currentBeamScale = 1.0;
        this.currentScale = 0.0;
        this.beamActive = false;
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
              this.beam.setScalingLocal([this.currentBeamScale, this.currentBeamScale, this.currentBeamScale])
            },
            changeComplete: (anim) => {
                this.beamScaleAnim = null;
                this.beamActive = true;
            },
        });
    }

    update(dt) {
        this.object.rotateAxisAngleDegObject([0, 1, 0], this.rotationSpeed * dt);

        if (this.currentAnim) {
            this.currentAnim.tick(getTime(this.engine));
        }

        if (this.beamScaleAnim) {
            this.beamScaleAnim.tick(getTime(this.engine));
        }

        if(this.beamActive) {
            let query = this.beamCollision.queryOverlaps();
            if(query.length) {
                for (let i = 0; i < query.length; i++) {
                    const component = query[i];
                    if(component.object.name === "robot") {
                        component.object.getComponent(Botcontroller).attractToUFO();
                    }
                }
            }
        }
    }
}
