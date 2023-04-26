import {Component, Property} from '@wonderlandengine/api';
import { fader } from './fade';
import { portalPlacement } from './place-portal';
import { objectPlacers } from './object-placer';

/**
 * game-manager
 */
export class GameManager extends Component {
    static TypeName = 'game-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        debug: Property.bool(false)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */

    static Dependencies = [];

    init() {
        console.log('init() with param', this.param);
        this.level = 0;
        this.scores = [];
        this.gamePhase = 0;

        /*
            Phase legend:
            0   Intro/main menu
            1   Portal placement
            2   Build mode
            3   Explore mode
        */

        this.engine.onXRSessionStart.add((s) => {
            fader.fadeOut(1000);
            this.narrationAudio0 = this.object.addComponent("howler-audio-source", {
                src: "narration/narration-0-intro.mp3",
                spatial: false,
                volume: 1,
                loop: false,
                autoplay: true
            });
            this.narrationAudio1 = this.object.addComponent("howler-audio-source", {
                src: "narration/narration-1-place-portal.mp3",
                spatial: false,
                volume: 1,
                loop: false,
                autoplay: false
            });
            this.narrationAudio2 = this.object.addComponent("howler-audio-source", {
                src: "narration/narration-4+5-an-entry-pint-glance-at-wrist.mp3",
                spatial: false,
                volume: 1,
                loop: false,
                autoplay: false
            });

            if(this.debug) {
                this.narrationAudio0.audio.rate(4.0);
                this.narrationAudio1.audio.rate(4.0);
                this.narrationAudio2.audio.rate(4.0);
            }


            this.narrationAudio0.audio.on('end', function(){
                console.log('Finished!');
                // START FIRST LEVEL PORTAL PLACEMENT PHASE
                this.level++;  // 1; start level one
                this.gamePhase++; // 1; portal placement game phase
                this.narrationAudio1.audio.play();
                // After initial narration, the next clip instructs the user to
                // place the portal so activate the portal placement mode here
                portalPlacement.activate(); // !TODO: erroring
                portalPlacement.addOnSpawnCompleteFunction(() => {
                    // this code should run once the portal is placed,
                    // and we should enable build mode there
                    console.log("Portal placed!!!")
                    this.narrationAudio2.audio.play();
                    
                    if(objectPlacers.right) objectPlacers.right.setActive(true);
                    // if(objectPlacers.left) objectPlacers.left.active = true;
                    
                    // Building mode needs to be enabled here
                    // Next narration fires on block placement
                });
            }.bind(this));
        });
    }

    start() {
        console.log('start() with param', this.param);
    }

    update(dt) {
        /* Called every frame. */

    }
}
