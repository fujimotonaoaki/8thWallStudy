"use strict";
const lerp = (x, y, p) => {
    return x + (y - x) * p;
}
import billboardParticle from "./assets/billboardParticle"
import postVert from './assets/glsl/postScene.vert'
import postFrag from './assets/glsl/postScene.frag'
import simplexNoise from "simplex-noise"
let theScene = null
let theRenderer = null
let theCamera = null
let maskBoxA = null
let maskBoxB = null
let rotateBoxs = []
let rotateBoxGroup = null
let maskScene
let postScene
let postCamera
let maskRenderTarget
let uniforms
let rotatePosition
let recordedDetailA = null
let recordedDetailB = null
const clock = new THREE.Clock()
let pointLight = null
let particle = null
let threshold = {value:0.0}
// let targetThreshold = 0
// let timeSpeed = 0.1;
let moveDuration = 2;
let isTargetA = false;

const EightIPipelineModule = () => {
    console.log('8thwall scene',THREE)
    const initXrScene = ({scene, camera}) => {
        const noise = new simplexNoise();
        camera.near = 0.001;
        rotatePosition = new THREE.Vector3(0,0,0)
        clock.start()
        postScene = new THREE.Scene()
        maskScene = new THREE.Scene()
        rotateBoxGroup = new THREE.Group()
        maskBoxA = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial({color:0x00fc00})
        )

        maskBoxB = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial({color:0x00fc00})
        )
        for (let i = 0; i < 10; i++)
        {
            var animateBox = new THREE.Mesh(
                    new THREE.BoxGeometry(1,1,1),
                    new THREE.MeshLambertMaterial({color:new THREE.Color(0.8,0.4,1)})
                )
            rotateBoxs.push(animateBox)
            rotateBoxGroup.add(animateBox)
            // maskScene.add(animateBox)
        }
        rotateBoxGroup.visible = false;
        maskScene.add(rotateBoxGroup)
        pointLight = new THREE.PointLight(0xffffff, 0.8)
        maskScene.add(pointLight)
        maskScene.add(new THREE.AmbientLight(0xffffff,0.8))
        maskBoxA.visible = false
        maskBoxB.visible = false

        maskScene.add(maskBoxA)
        maskScene.add(maskBoxB)

        postCamera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 2 );
        postCamera.position.set(0,0,1)
        maskRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight)
        camera.position.set(0, 3, 5)

        uniforms = {
            "source00": { value: maskRenderTarget.texture },
        }
        const postScreenMat = new THREE.ShaderMaterial({
            uniforms:uniforms,
            transparent: true,
            vertexShader: postVert,
            fragmentShader:postFrag
        })


        theScene.add(new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2,2),
            postScreenMat
        ))

        particle = new billboardParticle(clock,noise);
        scene.add(particle.mesh);

    }


    const showTarget = ({detail}) => {

        if (detail.name === 'test_image_target_yellow' && !isTargetA) {
            recordedDetailB = Object.assign({}, detail);
            // console.log("B ",recordedDetailB.position);
            maskBoxB.visible = true
            rotateBoxGroup.visible = true
            maskBoxB.position.copy(detail.position)
            maskBoxB.quaternion.copy(detail.rotation)
            maskBoxB.scale.set(detail.scale, detail.scale*(480/640), detail.scale*0.1)

        }

        if (detail.name === 'test_image_target_blue' && isTargetA) {
            recordedDetailA = Object.assign({}, detail);
            // console.log("A ", recordedDetailA);
            maskBoxA.visible = true
            rotateBoxGroup.visible = true

            maskBoxA.position.copy(detail.position)
            maskBoxA.quaternion.copy(detail.rotation)
            maskBoxA.scale.set(detail.scale, detail.scale*(480/640), detail.scale*0.1)
            pointLight.position.copy(detail.position)
            pointLight.quaternion.copy(detail.rotation)
            pointLight.position.add(new THREE.Vector3(0,2,0))
        }
    }

    const hideTarget = ({detail}) => {
        if (detail.name === 'test_image_target_blue') {

        }
    }

    const touchHandler = (e) => {
        // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
        // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
        XR8.XrController.recenter();
        if (e.touches.length == 2) {
            isTargetA = false;
            maskBoxA.visible = false;
            // timeSpeed = 0.04;
            // targetThreshold = 1;
            gsap.to(threshold, { duration:moveDuration, value: 1, ease: "power2.out", });
        }
        if (e.touches.length == 1) {
            isTargetA = true;
            maskBoxB.visible = false;
            // timeSpeed = -0.04;s

            gsap.to(threshold, { duration:moveDuration, value: 0, ease: "power2.out", });
            // targetThreshold = 0;
        }
    }


    return {
        // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
        name: '8thWall-MaskStudy',

        onStart: ({canvas, canvasWidth, canvasHeight}) => {
            const {scene, camera, renderer} = XR8.Threejs.xrScene()
            scene.add(new THREE.AxesHelper(200));
            theScene = scene
            theRenderer = renderer
            theRenderer.context.getExtension('WEBGL_debug_renderer_info')
            theCamera = camera

            initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.

            canvas.addEventListener('touchstart', touchHandler, true)  // Add touch listener.

            XR8.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
            })

        },


        // onUpdate is called once per camera loop prior to render.
        onUpdate: () => {

            theCamera.updateMatrixWorld()
            theCamera.matrixWorldInverse.getInverse(theCamera.matrixWorld)
            theRenderer.clear(true,true,true)

            let currentDetail = null;

            if(recordedDetailA != null && recordedDetailB == null)
            {
                currentDetail =  Object.assign({}, recordedDetailA);
            }



            if(recordedDetailA == null && recordedDetailB != null)
            {
                currentDetail =  Object.assign({}, recordedDetailB);
            }


            if(recordedDetailA != null && recordedDetailB != null)
            {

                console.log(recordedDetailA,recordedDetailB, "threshold:",threshold);

                // console.log(threshold);
                const posA = new THREE.Vector3().copy(recordedDetailA.position);
                const rotA = new THREE.Quaternion(recordedDetailA.rotation.x,recordedDetailA.rotation.y,recordedDetailA.rotation.z,recordedDetailA.rotation.w);
                const scaleA = recordedDetailA.scale;

                const posB = new THREE.Vector3().copy(recordedDetailB.position);
                const rotB = new THREE.Quaternion(recordedDetailB.rotation.x,recordedDetailB.rotation.y,recordedDetailB.rotation.z,recordedDetailB.rotation.w);
                const scaleB = recordedDetailB.scale;

                currentDetail = {
                    position: posA.lerp(posB,threshold.value),
                    rotation: rotA.slerp(rotB,threshold.value),
                    scale: lerp(scaleA,scaleB,threshold.value)
                }
                // currentDetail.position = new THREE.Vector3(recordedDetailA.x,recordedDetailA.y,recordedDetailA.z).lerp(new THREE.Vector3(recordedDetailB.position.x,),threshold);
                // currentDetail.rotation.slerp(recordedDetailB.rotation,threshold);
                // currentDetail.scale =  THREE.Math.lerp(recordedDetailA.scale, recordedDetailB.scale,threshold)

            }


            if(currentDetail != null)
            {



                if(particle != null){

                    particle.targetPosition = currentDetail.position;
                    particle.quaternion = currentDetail.rotation;
                    particle.scale = currentDetail.scale;
                    particle.update()
                }

                let step = Math.PI*2 / (rotateBoxs.length)
                let count = 0
                rotateBoxs.forEach((v)=>{
                    // console.log(count)
                    v.position.copy(currentDetail.position)
                    rotatePosition.set(Math.cos(count*step+clock.getElapsedTime())*currentDetail.scale, 0,  Math.sin(count*step+clock.getElapsedTime())*currentDetail.scale)
                    v.position.add(rotatePosition)
                    v.quaternion.copy(currentDetail.rotation)
                    // v.rota (new THREE.Vector3(simplex.noise2D(count, step),simplex.noise2D(step, count),0), clock.getElapsedTime())
                    // v.rotateOnAxis(new THREE.Vector3(THREE.Math))
                    // v.rotation.set(v.rotation.x+simplex.noise2D(count, step),v.rotation.y+simplex.noise2D(clock.getElapsedTime()*0.3, step)*Math.PI*2,v.rotation.z)
                    v.rotation.set(v.rotation.x+Math.sin(count*step),v.rotation.y+Math.cos((clock.getElapsedTime()*0.3+step)*Math.PI*2),v.rotation.z)
                    v.scale.set(currentDetail.scale*0.1, currentDetail.scale*0.1, currentDetail.scale*0.1)
                    count++
                })
            }

        },
        onRender: () => {
            theRenderer.setRenderTarget(maskRenderTarget)
            theRenderer.clear()
            theRenderer.render(maskScene, theCamera)
            theRenderer.setRenderTarget(null)
            theRenderer.state.reset()
            theRenderer.render(theScene, theCamera)
            // theRenderer.render(postScene,postCamera)
        },
        listeners: [
            {event: 'reality.imagefound', process: showTarget},
            {event: 'reality.imageupdated', process: showTarget},
            {event: 'reality.imagelost', process: hideTarget},
        ],
    }
}



const onxrloaded = () => {
    // XR8.xrController().configure({disableWorldTracking: true})

    const canvas = document.createElement("canvas");
    canvas.id = 'camerafeed';
    document.body.appendChild(canvas);
    XR8.addCameraPipelineModules([  // Add camera pipeline modules.
        // Existing pipeline modules.
        XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.
        XR8.Threejs.pipelineModule(),                // Creates a ThreeJS AR Scene.
        XR8.XrController.pipelineModule(),           // Enables SLAM tracking.
        XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
        XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
        XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
        XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
        // Custom pipeline modules.
        EightIPipelineModule(),
    ])

    // Open the camera and start running the camera run loop.
    XR8.run({canvas: canvas})
}

// Show loading screen before the full XR library has been loaded.
const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }