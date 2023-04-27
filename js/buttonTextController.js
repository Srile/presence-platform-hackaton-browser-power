import {Component, Type} from '@wonderlandengine/api';

/**
 * buttonTextController
 */
export class ButtonTextController extends Component {
    static TypeName = 'buttonTextController';
    /* Properties that are configurable in the editor */
    static Properties = {
        blockCountInitialValue: { type: Type.Number, default: 0 },
        id: { type: Type.Int, default: 0 },
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        console.log('init() with param', this.param);
        this.textComponent = this.object.children[1].getComponent('text', 0);
        this.textContent = `${window.seletables.blocks[this.id].name}\nCOUNT: ${window.seletables.blocks[this.id].stock}`;
        this.textComponent.text = this.textContent;

        window.blockCounts.emitters[this.id].add(this.updateBlockCountValue.bind(this))
    }

    updateBlockCountValue(data) {
        if (data && data.currentBlockCount) {
            window.seletables.blocks[this.id].stock = data.currentBlockCount;
            this.textContent = `${window.seletables.blocks[this.id].name}\nCOUNT: ${window.seletables.blocks[this.id].stock}`;
            this.textComponent.text = this.textContent;
        }
    }

    start() {}

    update(dt) {
        /* Called every frame. */
    }
}
