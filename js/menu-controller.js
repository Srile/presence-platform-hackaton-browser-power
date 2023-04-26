import {Component, Property} from '@wonderlandengine/api';
import { glMatrix, quat, vec3 } from 'gl-matrix';

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

    start() {
        console.log('start() with param', this.param);
    }

    toggleMenu(activate) {
        if (activate == this.isMenuVisible) return;
        this.planeMenu.active = activate;
        this.planeMenu.object.children.forEach(child => {
            child.active = activate;
        });
        this.isMenuVisible = activate;
    }

    isControllerPointingUp() {
        this.leftController.getForwardWorld(this.fowardTemp)
        var degreesFromUp = vec3.angle(this.fowardTemp, this.vec3Up);

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