import {Component, Property} from '@wonderlandengine/api';
import { fader } from './fade';
import { portalPlacement } from './place-portal';
import { alignToGrid, objectPlacers } from './object-placer';
import { objectRotates } from './object-rotate';
import { portalPlacementMarkers } from './portal-placement-marker';
import { ufo, UFOController } from './ufo-controller';
import { levelData } from './level-data';
import { vec3 } from 'gl-matrix';
import { HowlerAudioSource, PlaneDetection } from '@wonderlandengine/components';
import { botSpawner } from './spawn-bot';

export let gameManager;

export let currentLevelPlacements = new Map();
export let currentLevelPlacementsObjects = new Map();

export const TILE_WIDTH = 2;

let tempVecInt = new Int32Array(3);
let tempVecInt2 = new Int32Array(3);

/**
 * game-manager
 */
export class GameManager extends Component {
    static TypeName = 'game-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        debug: Property.bool(false),
        ufoBlock: Property.object(),
        ufo: Property.object(false),
        gameWinObject: Property.object(),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */

    static Dependencies = [];

    init() {
        this.level = 0;
        this.scores = [];
        this.gamePhase = -1;
        this.checkConfig = false;

        this.tempVec = new Float32Array(3);
        this.tempVec2 = new Float32Array(3);
        this.ufoHeightDistance = new Float32Array(3);
        this.ufoHeightDistance[1] = 0.4;

        this.ufoBlock.active = false;

        this.ufoComponent = this.ufo.getComponent(UFOController);
        this.planeDetection = this.object.getComponent(PlaneDetection);
        this.winAudio = this.gameWinObject.getComponent(HowlerAudioSource);

        gameManager = this;

        /*
            Phase legend:
            -1  Setup (Plane Tracking)
            0   Intro/main menu
            1   Portal placement
            2   Build mode
            3   Explore mode
        */

        this.engine.onXRSessionStart.add((s) => {
            setTimeout(() => {
                this.checkConfig = true;
            }, 2000);
        });
    }

    beginExperience() {
        this.gamePhase = 0;
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
            this.narrationAudio0.audio.rate(40.0);
            this.narrationAudio1.audio.rate(40.0);
            this.narrationAudio2.audio.rate(40.0);
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
                this.ufoBlock.getTranslationWorld(this.tempVec);
                vec3.add(this.tempVec2, this.tempVec, this.ufoHeightDistance);
                ufo.spawn(this.tempVec2);

                alignToGrid(this.tempVec, tempVecInt);
                // TODO: 9 fields on x/z and 4 steps up in y
                currentLevelPlacements.set(tempVecInt.toString(), 'ufo');
                tempVecInt[1] -= TILE_WIDTH / 2;
                currentLevelPlacements.set(tempVecInt.toString(), 'ufo');
                tempVecInt[1] += TILE_WIDTH / 2;
                tempVecInt[1] += TILE_WIDTH / 2;
                currentLevelPlacements.set(tempVecInt.toString(), 'ufo');
                tempVecInt[1] += TILE_WIDTH / 2;
                currentLevelPlacements.set(tempVecInt.toString(), 'ufo');
                tempVecInt[1] += TILE_WIDTH / 2;
                currentLevelPlacements.set(tempVecInt.toString(), 'ufo');

                // if(objectPlacers.left) objectPlacers.left.active = true;
                
                // Building mode needs to be enabled here
                // Next narration fires on block placement
            });
        }.bind(this));
    }

    beginExplore() {
        if(this.gamePhase !== 2) return;

        this.gamePhase = 3;

        // TODO: Begin bot spawning
    }

    winGame() {
        this.gameWinObject.active = true;
        this.winAudio.play();
        botSpawner.stopSpawn();
        fader.fadeIn(5000);
    }

    update(dt) {
        if(this.gamePhase === -1 && this.checkConfig && this.engine?.xr?.frame?.detectedPlanes?.size === 0) {
            // if(this.engine.xr.session.initiateRoomCapture) {
            //     this.engine.xr.session.initiateRoomCapture()
            //         .then((p) => {
                            // this.beginExperience();

            //             console.log('on initiated', p);
            //         }).catch(e => {
            //             console.error(e);
            //         });

            // } 
            // TODO: Enable with the next version of the MQ 
            console.error('PLEASE SETUP YOUR ROOM');
            this.checkConfig = false;
        } else if(this.gamePhase === -1 && this.checkConfig && this.engine?.xr?.frame?.detectedPlanes?.size > 0) {
            this.beginExperience();
            this.checkConfig = false;
        }
    }
}
