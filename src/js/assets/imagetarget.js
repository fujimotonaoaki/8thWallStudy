import videoFile from './img/videoMarker.mp4'
import marker from './img/marker.png'
export const imageTargetPipelineModule = (customThreeJsPipeline) => {

    let theScene = null
    let theRenderer = null
    let theCamera = null
    let maskBox = null
    let rotateBoxs = []
    // let characterTextures = [];
    let rotateBoxGroup = null
    let maskScene
    let postScene
    let postCamera
    let maskRenderTarget
    let uniforms
    let uniforms_video
    let rotatePosition
    let recordedDetail = null
    const clock = new THREE.Clock()
    let pointLight = null
    let video = null;
    let effectPlane = null;
    let isContentsStart = false;

    const initXrScene = ({scene, camera}) => {

        scene.add(new THREE.AmbientLight(0x404040, 5))
        camera.position.set(0, 3, 0)

        // console.log(marker_effect)
        const textureLoader = new THREE.TextureLoader();


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
        }
        rotateBoxGroup.visible = false;
        // maskScene.add(rotateBoxGroup)
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

        // scene.add(new THREE.AxesHelper(200))



        video = document.createElement('video')
        video.src = videoFile
        video.setAttribute('preload', 'auto')
        video.setAttribute('loop', '')
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')

        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBFormat
        texture.crossOrigin = 'anonymous'


        uniforms_video = {
            "time":{value:1.0},
            "threshold":{value:0.0},
            "texture": { value: texture },
            "baseTexture":{value:textureLoader.load(marker)}
        }

        effectPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1,1),
            new THREE.ShaderMaterial({
                uniforms:uniforms_video,
                transparent: true,
                vertexShader: document.getElementById('videoEffectVert').textContent,
                fragmentShader:document.getElementById('videoEffectFrag').textContent
            })
        )
        effectPlane.visible = false;

        maskScene.add(effectPlane);

        video.load();

    }

    // Places content over image target
    const showTarget = ({detail}) => {

        if(!isContentsStart) return;
        if (detail.name === 'marker_kanban') {

            // if(isTween == false)
            // {
            //     console.log(uniforms_video.threshold.value);
            //     isTween = true;
            //     new TWEEN.Tween(uniforms_video.threshold,700)
            //         .to({value:0.0})
            //         .easing(TWEEN.Easing.Elastic.Out)
            //         .onComplete(()=>{
            //             isTween = false;
            //         })
            //         .onUpdate(()=>{
            //             isTween = true;
            //             console.log(uniforms_video.threshold.value)
            //         })
            //         .start()
            // }

            uniforms_video.threshold.value = Math.min(uniforms_video.threshold.value + 0.05, 1);

            recordedDetail = detail

            effectPlane.position.copy(detail.position)
            effectPlane.quaternion.copy(detail.rotation)
            effectPlane.scale.set(detail.scale*(480/640), detail.scale, 1)
            effectPlane.visible = true
            video.play()

            pointLight.position.copy(detail.position)
            pointLight.quaternion.copy(detail.rotation)
            pointLight.position.add(new THREE.Vector3(0,2,0))
            rotateBoxGroup.visible = true





        }
    }

    // Hides the image frame when the target is no longer detected.
    const hideTarget = ({detail}) => {

        if (detail.name === 'marker_kanban') {

            uniforms_video.threshold.value =  0;

            rotateBoxGroup.visible = false
            effectPlane.visible = false;
            video.pause();

            isContentsStart = false;


            // animateBox.visible = false
        }
    }

    // Grab a handle to the threejs scene and set the camera position on pipeline startup.
    const onStart = ({canvas}) => {
        const {scene, camera, renderer} = customThreeJsPipeline.xrScene()

        canvas.addEventListener('touchstart', ()=>{
            isContentsStart = !isContentsStart;
        }, true)
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
        name: 'threejs-flyer',
        onStart,

        onUpdate: () => {
            theCamera.updateMatrixWorld()
            theCamera.matrixWorldInverse.getInverse(theCamera.matrixWorld)
            theRenderer.clear(true,true,true)
            uniforms_video.time.value = clock.getElapsedTime();
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
