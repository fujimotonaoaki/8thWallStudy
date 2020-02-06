import billboardParticle from "./billboardParticle";
export const imageTargetPipelineModule = () => {

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
    let particle


    // Populates some object into an XR scene and sets the initial camera position. The scene and
    // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
    const initXrScene = ({scene, camera}) => {
        console.log('initXrScene')

        // create the video element

        scene.add(new THREE.AmbientLight(0x404040, 5))

        // Set the initial camera position relative to the scene we just laid out. This must be at a
        // height greater than y=0.
        camera.position.set(0, 3, 0)

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
        rotateBoxGroup.visible = false;
        maskScene.add(rotateBoxGroup)
        pointLight = new THREE.PointLight(0xffffff, 0.8)
        maskScene.add(pointLight)
        maskScene.add(new THREE.AmbientLight(0xffffff,0.8))
        maskBox.visible = false

        maskScene.add(maskBox)

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
            vertexShader: document.getElementById('postVert').textContent,
            fragmentShader:document.getElementById('postFrag').textContent
        })


        postScene.add(new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2,2),
            postScreenMat
        ))

        scene.add(new THREE.AxesHelper(200))

        particle = new billboardParticle()
        console.log(particle)
        scene.add(particle.getMesh())

    }

    // Places content over image target
    const showTarget = ({detail}) => {
        // When the image target named 'model-target' is detected, show 3D model.
        // This string must match the name of the image target uploaded to 8th Wall.

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

    // Hides the image frame when the target is no longer detected.
    const hideTarget = ({detail}) => {

        if (detail.name === 'test_image_target_blue') {
            rotateBoxGroup.visible = false
            // animateBox.visible = false
        }
    }

    // Grab a handle to the threejs scene and set the camera position on pipeline startup.
    const onStart = ({canvas}) => {
        const {scene, camera, renderer} = XR8.Threejs.xrScene()

        theScene = scene
        theRenderer = renderer
        theRenderer.context.getExtension('WEBGL_debug_renderer_info')
        theCamera = camera  // Get the 3js scene from XR

        initXrScene({scene, camera}) // Add content to the scene and set starting camera position.

        // Sync the xr controller's 6DoF position and camera paremeters with our scene.
        XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
        })
    }

    return {
        // Camera pipeline modules need a name. It can be whatever you want but must be
        // unique within your app.
        name: 'threejs-flyer',

        // onStart is called once when the camera feed begins. In this case, we need to wait for the
        // XR8.Threejs scene to be ready before we can access it to add content. It was created in
        // XR8.Threejs.pipelineModule()'s onStart method.
        onStart,

        onUpdate: () => {
            theCamera.updateMatrixWorld()
            theCamera.matrixWorldInverse.getInverse(theCamera.matrixWorld)
            theRenderer.clear(true,true,true)
            particle.update()


            if(recordedDetail != null)
            {
                let step = Math.PI*2 / (rotateBoxs.length)
                let count = 0
                rotateBoxs.forEach((v)=>{
                    v.position.copy(recordedDetail.position)
                    v.quaternion.copy(recordedDetail.rotation)
                    // v.scale.set(recordedDetail.scale, recordedDetail.scale*(480/640), recordedDetail.scale*0.1)
                    // v.position.copy(recordedDetail.position)
                    rotatePosition.set(Math.cos(count*step+clock.getElapsedTime())*recordedDetail.scale,  0,Math.sin(count*step+clock.getElapsedTime())*recordedDetail.scale)
                    v.position.add(rotatePosition)
                    // v.quaternion.copy(recordedDetail.rotation)
                    // v.rotation.set(v.rotation.x+Math.sin(count*step),v.rotation.y+Math.cos((clock.getElapsedTime()*0.3+step)*Math.PI*2),v.rotation.z)

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

        // Listeners are called right after the processing stage that fired them. This guarantees that
        // updates can be applied at an appropriate synchronized point in the rendering cycle.
        listeners: [
            {event: 'reality.imagefound', process: showTarget},
            {event: 'reality.imageupdated', process: showTarget},
            {event: 'reality.imagelost', process: hideTarget},
        ],
    }
}
