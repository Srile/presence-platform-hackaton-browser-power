import {Component, Property, Type} from '@wonderlandengine/api';
import { selectables } from './menu-controller';
import { setSelectedBlockType } from './object-placer';

/**
 * check-collision
 */
export class CheckCollision extends Component {
    static TypeName = 'check-collision';
    /* Properties that are configurable in the editor */
    static Properties = {
        selectionColor: { type: Type.Color, default: [0.0, 1.0, 0.0, 1.0] },
        id: { type: Type.Int, default: 0 }
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.isColliding = false;
        this.didCollide = false;
        this.currentMesh = this.object.getComponent('mesh', 0);
        this.currentMaterial = this.currentMesh.material;
        this.meshColor = new Float32Array(this.currentMaterial.diffuseColor);
        this.activeColor = this.selectionColor;
        this.isCurrentlySelected = false;
        this.isUnselecting = false;

        this.collisionComponent = this.object.getComponent('collision', 0);
    }

    start() {
        console.log('start() with param', this.param);
    }

    onCollisionEnter() {
        if (this.didCollide) return;
        console.log("onCollisionEnter")
        this.didCollide = true;
        this.currentMaterial.diffuseColor = this.activeColor;

        // enter in collision with already selected object
        if (selectables.currentId == this.id) {
            this.isUnselecting = true;
        }

        // set the global variable to the current id
        selectables.currentId = this.id;
    }

    onCollision() {
        this.isColliding = true;
        this.onCollisionEnter();
    }

    onCollisionLeft() {
        if (!this.isColliding) return;
        console.log("onCollisionLeft")
        this.isColliding = false;
        this.didCollide = false;

        this.currentMaterial.diffuseColor = this.meshColor;
        
        if (this.isUnselecting) {
            this.unSelect()
        }
    }

    unSelect() {
        window.unselectObject(this.id);
        this.isUnselecting = false;
    }

    isSelected() {
        // was selected before but unselect now
        if (this.isCurrentlySelected == true && this.id != selectables.currentId) {
            this.isCurrentlySelected = false;
            this.currentMaterial.diffuseColor = this.meshColor;
            return;
        }

        // no currently selected object
        if (this.id != selectables.currentId) return;      
        
        // select the current object
        if (this.isCurrentlySelected == false) { window.spawnObject(); }
        setSelectedBlockType(selectables.blocks[this.id].type)
        this.isCurrentlySelected = true;
        this.currentMaterial.diffuseColor = [0.0, 0.0, 0.0, 1.0];
    }

    update(dt) {
        /* Called every frame. */
        const overlaps = this.collisionComponent.queryOverlaps();

        // check if the current object is selected
        this.isSelected();

        if(overlaps.length) {
            this.onCollision()
        } else if(!overlaps.length){
            this.onCollisionLeft()
        }
    }
}
