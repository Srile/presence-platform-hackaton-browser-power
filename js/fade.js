import {Component, Type} from '@wonderlandengine/api';
import anime from 'animejs/lib/anime.es.js';
import { getTime } from './place-portal';

export let fader;

export class Fade extends Component {
    static TypeName = 'fade';
    static Properties = {
        fadeDuration: {type: Type.Int, default: 300},
        autoFade: {type: Type.Bool, default: false},
    };

    init() {
        fader = this;
        this.material = this.object.getComponent('mesh').material;
        this.currentFade = this.material.color[3];
        this.color = new Float32Array(4);
        this.color.set(this.material.color);
        this.mesh = this.object.getComponent('mesh');
        this.mesh.active = true;
        if(this.autoFade) {
            this.fadeOut(1000);
        }
    }

    fadeIn(delay, fadeOutAfter, override) {
        if (override) this.currentAnim = null;
        if (this.currentAnim) return;
        this.mesh.active = true;
        this.currentAnim = anime({
            targets: this,
            easing: 'linear',
            currentFade: 1.0,
            delay: delay || 0,
            duration: this.fadeDuration,
            autoplay: false,
            update: (anim) => {
                this.color[3] = this.currentFade;
                this.material.color = this.color;
            },
            changeComplete: (anim) => {
                this.currentAnim = null;
                if (fadeOutAfter) {
                    this.fadeOut(400);
                }
            },
        });
    }

    fadeOut(delay, override) {
        if (override) this.currentAnim = null;
        if (this.currentAnim) return;
        this.currentAnim = anime({
            targets: this,
            easing: 'linear',
            currentFade: 0.0,
            delay: delay || 0,
            autoplay: false,
            duration: this.fadeDuration,
            update: (anim) => {
                this.color[3] = this.currentFade;
                this.material.color = this.color;
            },
            changeComplete: (anim) => {
                this.mesh.active = false;
                this.currentAnim = null;
            },
        });
    }

    setFade(amount) {
        if (this.currentAnim) return;

        this.mesh.active = true;
        amount = Math.max(amount, 0.0);
        this.currentFade = amount;
        this.color[3] = amount;
        this.material.color = this.color;
        if (amount == 0.0) {
            this.mesh.active = false;
        }
    }

    update(dt) {
        if (this.currentAnim) {
            this.currentAnim.tick(getTime(this.engine));
        }
    }
}
