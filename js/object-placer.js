import { Collider, CollisionComponent, Component, MeshComponent, Property } from '@wonderlandengine/api';
import { vec3 } from 'gl-matrix';

let currentObjects = [];

export let objectPlacers = {}

/**
 * object-placer
 */
export class ObjectPlacer extends Component {
    static TypeName = 'object-placer';
    /* Properties that are configurable in the editor */
    static Properties = {
        gridIncrementSteps: Property.float(0.5),
        handedness: Property.string("left"),
        meshCube: Property.mesh(),
        meshCubeNoArrow: Property.mesh(),
        // mesh0SpringWithArrow: Property.mesh(),
        // mesh1SpringWithArrow: Property.mesh(),
        // mesh0SpringNoArrow: Property.mesh(),
        // mesh1SpringNoArrow: Property.mesh(),
        allowedMaterial: Property.material(),
        meshCubMat: Property.material(),
        // meshCubeNoArrowMat: Property.material(),
        // mesh0SpringWithArrowMat: Property.material(),
        // mesh1SpringWithArrowMat: Property.material(),
        // mesh0SpringNoArrowMat: Property.material(),
        // mesh1SpringNoArrowMat: Property.material(),
        disallowedMaterial: Property.material(),
        cube0Mat: Property.material(),
        cube1Mat: Property.material(),
        cube2Mat: Property.material(),
        cube3Mat: Property.material(),
        cube4Mat: Property.material(),
        blockSpace: Property.object()
    };

    _tempVec = new Float32Array(3);
    _zeros = 0;
    _multiplier = 1;
    _boxExtents = [0.095, 0.095, 0.095];

    _onDeactivateCallbacks = [];
    _onActivateCallbacks = [];

    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    start() {
        // this.meshObjects = [
        //     [this.meshCube],
        //     [this.meshCube],
        //     [this.meshCubeNoArrow],
        //     [this.mesh0SpringWithArrow, this.mesh1SpringWithArrow],
        //     [this.mesh0SpringNoArrow, this.mesh1SpringNoArrow]
        // ]

        this.meshObjects = [
            [this.meshCubeNoArrow],
            [this.meshCubeNoArrow],
            [this.meshCubeNoArrow],
            [this.meshCubeNoArrow],
            [this.meshCubeNoArrow],
        ]
        this.allowedMaterials = [
            this.cube0Mat,
            this.cube1Mat,
            this.cube2Mat,
            this.cube3Mat,
            this.cube4Mat
        ]
        objectPlacers[this.handedness] = this;

        let str = this.gridIncrementSteps.toFixed(20);  // Set the number of digits to a large value

        // Loop through the string representation of the number

        this.positionDummy = this.engine.scene.addObject(this.blockSpace);

        this._onSessionStartCallback = this.setupVREvents.bind(this);
        // this.engine.onXRSessionStart.add(this._onSessionStartCallback);

        // TODO: Might need to ignore the first zero, 0.xxx
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '0') {
                this._zeros++;  // Increment the count of zeros
            } else {
                break;  // Stop counting zeros when a non-zero digit is encountered
            }
        }

        this._multiplier = 10 * this._zeros;


    }

    setupVREvents(s) {
        if (!s) console.error('setupVREvents called without a valid session');

        /* If in VR, one-time bind the listener */
        // const onSelect = this.onSelect.bind(this);
        // s.addEventListener('select', onSelect);
        const onSelectStart = this.onSelectStart.bind(this);
        s.addEventListener('selectstart', onSelectStart);
        const onSelectEnd = this.onSelectEnd.bind(this);
        s.addEventListener('selectend', onSelectEnd);

        this._onDeactivateCallbacks.push(() => {
            if (!this.engine.xrSession) return;
            // s.removeEventListener('select', onSelect);
            s.removeEventListener('selectstart', onSelectStart);
            s.removeEventListener('selectend', onSelectEnd);
        });
    }

    setActive(b) {
        if (b) {
            this.engine.onXRSessionStart.add(this._onSessionStartCallback);

            /* Ensure all event listeners are removed */
            for (const f of this._onActivateCallbacks) f();
        } else {
            this.engine.onXRSessionStart.remove(this._onSessionStartCallback);

            /* Ensure all event listeners are removed */
            for (const f of this._onDeactivateCallbacks) f();
        }
    }

    /** 'selectstart' event listener */
    onSelectStart(e) {
        if (e.inputSource.handedness == this.handedness) {
            // Create Cube
            this.currentCube = this.engine.scene.addObject(this.blockSpace);
            this.currentCube.setScalingLocal(this._boxExtents);

            if (window.seletables.currentId != -1) {
                this.meshObjects[window.seletables.currentId].forEach((mesh, index) => {
                    // console.log("INDEX: " + index)

                    // console.log("-------------------------------------")
                    // console.log("window.seletables.currentId: " + window.seletables.currentId)
                    // console.log("index: " + index)
                    // console.log(this.allowedMaterials)
                    // console.log(this.allowedMaterials[window.seletables.currentId][index])

                    this.currentCube.meshComponent = this.currentCube.addComponent(MeshComponent, {
                        material: this.allowedMaterials[window.seletables.currentId],
                        mesh: mesh,
                    })

                    // this.currentCube.meshComponent = this.currentCube.addComponent(MeshComponent, {
                    //     material: this.allowedMaterials[window.seletables.currentId][index],
                    //     mesh: mesh,
                    // })
                })
            } else {
                this.currentCube.meshComponent = this.currentCube.addComponent(MeshComponent, {
                    material: this.allowedMaterials[0],
                    mesh: this.meshCube,
                })
            }

            this.currentCube.collisionComponent = this.currentCube.addComponent(CollisionComponent, {
                group: (1 << 2),
                extents: this._boxExtents,
                collider: Collider.Sphere
            });


            this.currentCube.name = "BOUNxCE"
            this._placementAllowed = false;
            this._isDown = true;
        }
    }

    /** 'selectend' event listener */
    onSelectEnd(e) {
        if (e.inputSource.handedness == this.handedness) {
            this._isDown = false;

            if (this._placementAllowed) {
                currentObjects.push(this.currentCube);
                this.currentCube.collisionComponent = this.currentCube.addComponent(CollisionComponent, {
                    group: (1 << 3),
                    extents: this._boxExtents,
                    collider: Collider.Sphere
                });
            }
            else this.currentCube.destroy();

            console.log('SPAWN CUBE');
        }
    }

    update(dt) {
        if (this._isDown) {
            this.object.getTranslationWorld(this._tempVec);
            this.positionDummy.setTranslationWorld(this._tempVec);
            this.positionDummy.getTranslationLocal(this._tempVec);

            // this.blockSpace.transformPointInverseWorld(this._tempVec, this._tempVec);

            vec3.scale(this._tempVec, this._tempVec, this._multiplier);
            vec3.round(this._tempVec, this._tempVec);
            vec3.scale(this._tempVec, this._tempVec, 1.0 / this._multiplier);

            this.currentCube.setTranslationLocal(this._tempVec);

            const overlaps = this.currentCube.collisionComponent.queryOverlaps();

            if (overlaps.length && this._placementAllowed) {
                this.currentCube.meshComponent = this.disallowedMaterial;
                this._placementAllowed = false;
            } else if (!overlaps.length && !this._placementAllowed) {
                this.currentCube.meshComponent = this.allowedMaterial;
                this._placementAllowed = true;
            }
        }
        /* Called every frame. */
    }
}
