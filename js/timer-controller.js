import {Component, Property, Emitter} from '@wonderlandengine/api';

/**
 * timer-controller
 */
export class TimerController extends Component {
    static TypeName = 'timer-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.isCounting = false;
        this.elapsedTime = 0;

        this.textComponent = this.object.children[0].getComponent('text', 0)
        const emitter = new Emitter();
        emitter.add(this.toggleTimer.bind(this));

        // Start the timer
        // emitter.notify({ startTimer: true });

        // Stop the timer
        // emitter.notify({ startTimer: false });
    }

    start() {
        console.log('start() with param', this.param);
    }

    toggleTimer(event) {
        if (event && event.startTimer) {
            this.isCounting = event.startTimer;
        } else if (event && !event.startTimer) {
            this.elapsedTime = 0;
            this.isCounting = false;
        }
    }

    update(dt) {
        if (this.isCounting) { this.elapsedTime += dt; }
        this.textComponent.text = `${this.elapsedTime.toFixed(0)}`
        /* Called every frame. */
    }
}
