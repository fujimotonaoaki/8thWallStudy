
const applicationName = "8thWall-8i"
const version = "0.1"
import gsap from "gsap"
import postVert from './assets/glsl/postScene.vert'
import postFrag from './assets/glsl/postScene.frag'
const SimplexNoise = require('simplex-noise')
const simplex = new SimplexNoise(Math.random)
let theScene = null
let theRenderer = null
let theCamera = null
let maskBox = null
let rotateBoxs = []
let rotateBoxGroup = null
let maskScene
let postScene
let postCamera
let maskRenderTarget
let uniforms
let rotatePosition
let recordedDetail = null
const clock = new THREE.Clock()
let pointLight = null

const EightIPipelineModule = () => {

    const initXrScene = ({scene, camera}) => {

        rotatePosition = new THREE.Vector3(0,0,0)
        clock.start()
        postScene = new THREE.Scene()
        maskScene = new THREE.Scene()
        rotateBoxGroup = new THREE.Group()
        maskBox = new THREE.Mesh(
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

        maskScene.add(rotateBoxGroup)
        pointLight = new THREE.PointLight(0xffffff, 0.8)
        maskScene.add(pointLight)
        maskScene.add(new THREE.AmbientLight(0xffffff,0.8))
        maskBox.visible = false

        maskScene.add(maskBox)

        var aspect = window.innerWidth / window.innerHeight;
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


        postScene.add(new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2,2),
            postScreenMat
        ))

        // Update()

    }
    const showTarget = ({detail}) => {

        if (detail.name === 'test_image_target_blue') {
            recordedDetail = detail
            maskBox.position.copy(detail.position)
            maskBox.quaternion.copy(detail.rotation)
            maskBox.scale.set(detail.scale, detail.scale*(480/640), detail.scale*0.1)
            maskBox.visible = true
            pointLight.position.copy(detail.position)
            pointLight.quaternion.copy(detail.rotation)
            pointLight.position.add(new THREE.Vector3(0,2,0))
            rotateBoxGroup.visible = true
        }
    }
    // const Update =()=>{
    //
    //     requestAnimationFrame(Update)
    // }

    // Hides the image frame when the target is no longer detected.
    const hideTarget = ({detail}) => {
        if (detail.name === 'test_image_target_blue') {
            // maskBox.visible = false
            // animateBox.visible = false
        }
    }

    const touchHandler = (e) => {
        // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
        // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
        if (e.touches.length == 2) {
            XR8.XrController.recenter()
        }
    }

    return {
        // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
        name: '8thWall-8i',

        onStart: ({canvas, canvasWidth, canvasHeight}) => {
            const {scene, camera, renderer} = XR8.Threejs.xrScene()

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

            //8i Logic
            theCamera.updateMatrixWorld();
            theCamera.matrixWorldInverse.getInverse(theCamera.matrixWorld);
            theRenderer.clear(true,true,true)


            if(recordedDetail != null)
            {
                let step = Math.PI*2 / (rotateBoxs.length)
                let count = 0
                rotateBoxs.forEach((v)=>{
                    console.log(count)
                    v.position.copy(recordedDetail.position)
                    rotatePosition.set(Math.cos(count*step+clock.getElapsedTime())*recordedDetail.scale, 0,  Math.sin(count*step+clock.getElapsedTime())*recordedDetail.scale)
                    v.position.add(rotatePosition)
                    v.quaternion.copy(recordedDetail.rotation)
                    // v.rota (new THREE.Vector3(simplex.noise2D(count, step),simplex.noise2D(step, count),0), clock.getElapsedTime())
                    // v.rotateOnAxis(new THREE.Vector3(THREE.Math))
                    v.rotation.set(v.rotation.x+simplex.noise2D(count, step),v.rotation.y+simplex.noise2D(clock.getElapsedTime()*0.3, step)*Math.PI*2,v.rotation.z)
                    v.scale.set(recordedDetail.scale*0.2, recordedDetail.scale*0.2, recordedDetail.scale*0.2)
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
            theRenderer.render(postScene,postCamera)
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
    XR8.run({canvas: document.getElementById('camerafeed')})
}

// Show loading screen before the full XR library has been loaded.
const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }