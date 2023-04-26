import {Component, Property, Emitter} from '@wonderlandengine/api';

/**
 * counter-controller
 */
export class CounterController extends Component {
    static TypeName = 'counter-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        param: Property.float(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        const emitter = new Emitter();
        this.textComponent = this.object.children[0].getComponent('text', 0)
        this.textComponent.text = `0`

        emitter.add(this.updateCounter.bind(this));

        // Update bots count
        // emitter.notify({ updateBotsCount: true });
    }

    start() {
        console.log('start() with param', this.param);
    }

    updateCounter(event) {
        if (event && event.updateBotsCount) { 
            this.textComponent.text = `${window.botsCount}`
        }
    }

    update(dt) {
        /* Called every frame. */
    }
}
