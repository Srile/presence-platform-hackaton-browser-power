import {Component, Property} from '@wonderlandengine/api';
import { fader } from './fade';
import { portalPlacement } from './place-portal';
import { objectPlacers } from './object-placer';
import { objectRotates } from './object-rotate';
import { portalPlacementMarkers } from './portal-placement-marker';
import { UFOController } from './ufo-controller';
import { levelData } from './level-data';

export let gameManager;

/**
 * game-manager
 */
export class GameManager extends Component {
    static TypeName = 'game-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        debug: Property.bool(false),
        ufoBlock: Property.object(),
        ufo: Property.object(false)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */

    static Dependencies = [];

    init() {
        this.level = 0;
        this.scores = [];
        this.gamePhase = 0;

        this.tempVec = new Float32Array(3);

        this.ufoBlock.active = false;
        this.ufoComponent = this.ufo.getComponent(UFOController);

        gameManager = this;

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
                this.gamePhase++; // 1; portal placement game phase
                this.narrationAudio1.audio.play();
                // After initial narration, the next clip instructs the user to
                // place the portal so activate the portal placement mode here
                portalPlacement.activate();
                portalPlacement.addOnSpawnCompleteFunction(() => {
                    // this code should run once the portal is placed,
                    // and we should enable build mode there
                    this.narrationAudio2.audio.play();
                    
                    if(objectPlacers.right) objectPlacers.right.setActive(true);
                    if(objectRotates.left) objectRotates.left.setActive(true);

                    const currentLevelData = levelData[this.level];

                    this.ufoBlock.active = true;
                    this.ufoBlock.setTranslationLocal(currentLevelData.endPositionDistance);

                    // if(objectPlacers.left) objectPlacers.left.active = true;
                    
                    // Building mode needs to be enabled here
                    // Next narration fires on block placement
                });
            }.bind(this));
        });
    }

    beginExplore() {
        if(this.gamePhase !== 2) return;

        this.gamePhase = 3;

        // TODO: Begin bot spawning
    }

    update(dt) {
        /* Called every frame. */

    }
}
