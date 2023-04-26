import {Component, Property} from '@wonderlandengine/api';
import { glMatrix, quat, vec3 } from 'gl-matrix';

window.seletables = {
    currentId: -1,
    blocks: [
        { name: 'menu0' },
        { name: 'menu1' },
        { name: 'menu2' },
        { name: 'menu3' },
        { name: 'menu4' },
    ]
}

window.botsCount = 0;

// call everytime the selection is changed to a new selection
window.spawnObject = function() {
    if (window.seletables.currentId == -1) return;
    console.log("Span object name: " + window.seletables.blocks[window.seletables.currentId].name);
}

// call everytime a selected object is unselected
window.unselectObject = function(previousSelectionId) {
    console.log("Unselect prevous selection: " + previousSelectionId);
    window.seletables.currentId = -1;
}

// call when exit collision with exploe button
window.startExplore = () => {
    console.log("startExplore")
}

/**
 * menu-controller
 */
export class MenuController extends Component {
    static TypeName = 'menu-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        leftController: Property.object(),
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.controllerPosition = new Float32Array(3);
        this.controllerRotation = new Float32Array(4);
        this.planeMenu = this.object.children[0].getComponent('mesh', 0);
        this.fowardTemp = new Float32Array(3);
        this.vec3Up = new Float32Array([0, 1, 0]);
        this.isMenuVisible = false;
        this.toggleMenu(false);
    }

    start() {}

    traverse(node, callback) {
        callback(node);
        for (var i = 0; i < node.children.length; i++) {
            this.traverse(node.children[i], callback);
        }
    }

    toggleMenu(activate) {
        if (activate == this.isMenuVisible) return;

        this.traverse(this.object, (node) => {
            // don't toggle the menu container
            if (node.name != "menu-container") {
                node.active = activate;
            }
        })

        this.isMenuVisible = activate;
    }

    isControllerPointingUp() {
        this.leftController.getForwardWorld(this.fowardTemp)
        var degreesFromUp = vec3.angle(this.fowardTemp, this.vec3Up);

        // console.log("degreesFromUp: " + degreesFromUp)

        // the value of 1.0 is arbitrary, but it works well for now
        return (degreesFromUp > 1.0)
    }

    update(dt) {
        /* Called every frame. */
        this.controllerPosition = this.leftController.getTransformWorld();
        this.object.setTransformWorld(this.controllerPosition);

        this.controllerRotation = this.leftController.getRotationWorld();

        // Toggle menu if controller is pointing up show the menu
        this.toggleMenu(this.isControllerPointingUp());
    }
}