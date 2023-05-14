import {CollisionComponent, Component, Property} from '@wonderlandengine/api';
import anime from 'animejs/lib/anime.es.js';
import { getTime } from './place-portal';
import { BotController } from './bot-controller';
import { botSpawner } from './spawn-bot';
import { fader } from './fade';
import { HowlerAudioSource } from '@wonderlandengine/components';
import { gameManager } from './game-manager';

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

        ufo = this;

        this.beam = this.object.children[0];

        this.currentBeamScale = 1.0;
        this.currentScale = 0.0;
        this.beamActive = false;
        this.object.setScalingLocal([this.currentScale, this.currentScale, this.currentScale])
        this.loopAudio = this.object.getComponent(HowlerAudioSource);
        this.beamAudio = this.beam.getComponent(HowlerAudioSource);

        this.collectedRobots = 0;
    }

    spawn(position) {
        this.object.setPositionWorld(position)
        this.loopAudio.play();

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
                this.currentAnim = null;
                this.spawnBeam();
            },
        });
    }

    flyAway() {
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

    onRobotCollected() {
        this.collectedRobots++;
        this.beamAudio.play();
        if(this.collectedRobots === 10) {
            gameManager.winGame();
            this.loopAudio.stop();
        }
    }

    update(dt) {
        this.object.rotateAxisAngleDegObject([0, 1, 0], this.rotationSpeed * dt);

        if (this.currentAnim) {
            this.currentAnim.tick(getTime(this.engine));
        }

        if (this.beamScaleAnim) {
            this.beamScaleAnim.tick(getTime(this.engine));
        }

        // if(this.beamActive) {
        //     let query = this.beamCollision.queryOverlaps();
        //     if(query.length) {
        //         for (let i = 0; i < query.length; i++) {
        //             const component = query[i];
        //             if(component.object.name === "robot") {
        //                 component.object.getComponent(BotController).attractToUFO();
        //                 this.collectedRobots++;

        //                 if(this.collectedRobots >= 10) {
        //                     this.gameWinObject.active = true;
        //                     botSpawner.stopSpawn();
        //                     fader.fadeIn(5000);
        //                 }
        //             }
        //         }
        //     }
        // }
    }
}
