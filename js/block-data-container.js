import {Component, Property} from '@wonderlandengine/api';

export let blockDataContainer;

export const BLOCK_TYPES = {
    normal: 'block',
    turnRight: 'turn',
}

/**
 * block-data-container
 */
export class BlockDataContainer extends Component {
    static TypeName = 'block-data-container';
    /* Properties that are configurable in the editor */
    static Properties = {
        normalBlockMesh: Property.mesh(),
        normalBlockMaterial: Property.material(),
        turnRightBlockMesh: Property.mesh(),
        turnRightBlockMaterial: Property.material(),
    };
    init() {
        blockDataContainer = this;
    }

    getMesh(type) {
        switch(type) {
            case BLOCK_TYPES.normal:
                return this.normalBlockMesh;
            case BLOCK_TYPES.turnRight:
                return this.turnRightBlockMesh
        }
    }

    getMaterial(type) {
        switch(type) {
            case BLOCK_TYPES.normal:
                return this.normalBlockMaterial;
            case BLOCK_TYPES.turnRight:
                return this.turnRightBlockMaterial
        }
    }
}
