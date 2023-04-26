import {Component, Property} from '@wonderlandengine/api';

/**
 * game-manager
 */
export class GameManager extends Component {
    static TypeName = 'game-manager';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
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

        setTimeout(() => {
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

            this.narrationAudio0.audio.on('end', function(){
                console.log('Finished!');
                // START FIRST LEVEL PORTAL PLACEMENT PHASE
                this.level++;  // 1; start level one
                this.gamePhase++; // 1; portal placement game phase
                this.narrationAudio1.audio.play();
                // After initial narration, the next clip instructs the user to
                // place the portal so activate the portal placement mode here
            }.bind(this));
        }, 3000);
    }

    start() {
        console.log('start() with param', this.param);
    }

    update(dt) {
        /* Called every frame. */

    }
}
