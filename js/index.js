/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 *     - `wle:auto-constants:start` and `wle:auto-constants:end`: The project's constants,
 *        such as the project's name, whether it should use the physx runtime, etc...
 *     - `wle:auto-benchmark:start` and `wle:auto-benchmark:end`: Append the benchmarking code
 */

/* wle:auto-imports:start */
import {Cursor} from '@wonderlandengine/components';
import {FingerCursor} from '@wonderlandengine/components';
import {HandTracking} from '@wonderlandengine/components';
import {HowlerAudioListener} from '@wonderlandengine/components';
import {HowlerAudioSource} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {PlaneDetection} from '@wonderlandengine/components';
import {PlayerHeight} from '@wonderlandengine/components';
import {VrModeActiveSwitch} from '@wonderlandengine/components';
import {BlockDataContainer} from './block-data-container.js';
import {BotController} from './bot-controller.js';
import {ButtonTextController} from './buttonTextController.js';
import {CheckButtonCollision} from './check-button-collision.js';
import {CheckCollision} from './check-collision.js';
import {CounterController} from './counter-controller.js';
import {Fade} from './fade.js';
import {GameManager} from './game-manager.js';
import {MenuController} from './menu-controller.js';
import {ObjectPlacer} from './object-placer.js';
import {ObjectRotate} from './object-rotate.js';
import {PlacePortal} from './place-portal.js';
import {PortalPlacementMarker} from './portal-placement-marker.js';
import {RobotPool} from './robot-pool.js';
import {SpawnBot} from './spawn-bot.js';
import {TimerController} from './timer-controller.js';
import {UFOController} from './ufo-controller.js';
/* wle:auto-imports:end */

import {loadRuntime} from '@wonderlandengine/api';
import * as API from '@wonderlandengine/api'; // Deprecated: Backward compatibility.
import { Globals, ComponentUtils } from 'wle-pp';

/* wle:auto-constants:start */
const RuntimeOptions = {
    physx: false,
    loader: false,
    xrFramebufferScaleFactor: 1,
    canvas: 'canvas',
};
const Constants = {
    ProjectName: 'Nano Nav',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local','plane-detection',],
    WebXROptionalFeatures: ['local','local-floor','hand-tracking','hit-test','anchors',],
};
/* wle:auto-constants:end */

const engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);
Object.assign(engine, API); // Deprecated: Backward compatibility.
window.WL = engine; // Deprecated: Backward compatibility.

engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

/* WebXR setup. */

function requestSession(mode) {
    engine
        .requestXRSession(
            mode,
            Constants.WebXRRequiredFeatures,
            Constants.WebXROptionalFeatures
        )
        .catch((e) => console.error(e));
}

function setupButtonsXR() {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported;
        arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
    const vrButton = document.getElementById('vr-button');
    if (vrButton) {
        vrButton.dataset.supported = engine.vrSupported;
        vrButton.addEventListener('click', () => requestSession('immersive-vr'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(Cursor);
engine.registerComponent(FingerCursor);
engine.registerComponent(HandTracking);
engine.registerComponent(HowlerAudioListener);
engine.registerComponent(HowlerAudioSource);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(PlaneDetection);
engine.registerComponent(PlayerHeight);
engine.registerComponent(VrModeActiveSwitch);
engine.registerComponent(BlockDataContainer);
engine.registerComponent(BotController);
engine.registerComponent(ButtonTextController);
engine.registerComponent(CheckButtonCollision);
engine.registerComponent(CheckCollision);
engine.registerComponent(CounterController);
engine.registerComponent(Fade);
engine.registerComponent(GameManager);
engine.registerComponent(MenuController);
engine.registerComponent(ObjectPlacer);
engine.registerComponent(ObjectRotate);
engine.registerComponent(PlacePortal);
engine.registerComponent(PortalPlacementMarker);
engine.registerComponent(RobotPool);
engine.registerComponent(SpawnBot);
engine.registerComponent(TimerController);
engine.registerComponent(UFOController);
/* wle:auto-register:end */

Globals.initEngine(engine);

ComponentUtils.setDefaultWLComponentCloneCallbacks(engine);

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */