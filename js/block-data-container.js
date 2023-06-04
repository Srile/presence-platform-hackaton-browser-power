import {Component, Property} from '@wonderlandengine/api';
import { Vec3Utils, lookAt } from 'wle-pp';

export let blockDataContainer;

export const BLOCK_TYPES = {
    normal: 'block',
    turnRight: 'turn',
}

let _tempVec = new Float32Array(3);
let _tempVec2 = new Float32Array(3);
const up = [0.0, 1.0, 0.0];

export const BLOCK_FUNCTIONS = {
    turn: (block, bot) => {
        block.getPositionWorld(_tempVec);
        block.getRightWorld(_tempVec2);

        Vec3Utils.add(_tempVec, _tempVec2, _tempVec);

        console.log('TURN');

        lookAt(bot, _tempVec, up);
    },
}

export function isBlockRotatable(type) {
    return type === BLOCK_TYPES.turnRight;
}

export function isBlockSpecial(type) {
    return type === BLOCK_TYPES.turnRight;
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
