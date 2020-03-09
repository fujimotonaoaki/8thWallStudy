import {customThreejsPipelineModule} from './assets/customThreejsPipelineModule'
import {imageTargetPipelineModule} from './assets/imagetarget'
import MapScene from "./assets/mapScene";
const myThreejsModule = customThreejsPipelineModule();

const onxrloaded = () => {
    XR8.addCameraPipelineModules([  // Add camera pipeline modules.
        // Existing pipeline modules.
        XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
        myThreejsModule,                // Creates a ThreeJS AR Scene.
        XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
        XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
        XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
        XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
        XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
        // Custom pipeline modules.
        imageTargetPipelineModule(myThreejsModule),
    ])

    // Open the camera and start running the camera run loop.
    XR8.run({canvas: document.getElementById('camerafeed')})
}


// Show loading screen before the full XR library has been loaded.
const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }
