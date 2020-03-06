import {customThreejsPipelineModule} from "./customThreejsPipelineModule";

const myThreeJsModule = customThreejsPipelineModule();

const emptyPipelineModule = () => {
    const initXrScene = ({ scene, camera, renderer}) => {

    };

    const placeObjectTouchHandler = (e) => {


        if (e.touches.length == 2) {
            XR8.XrController.recenter()
        }

        if (e.touches.length > 2) {
            return
        }

        if (intersects.length == 1 && intersects[0].object == surface) {
        }
    }

    return {
        // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
        name: 'placeground',

        onStart: ({canvas, canvasWidth, canvasHeight}) => {
            const {scene, camera, renderer} = myThreeJsModule.xrScene();

            initXrScene({ scene, camera, renderer}) // Add objects to the scene and set starting camera position.



            canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

            animate();
            function animate(time) {
                requestAnimationFrame(animate);
            }

            // Sync the xr controller's 6DoF position and camera paremeters with our scene.
            XR8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
            })
        },
        onRender: () => {



        },
    }
}