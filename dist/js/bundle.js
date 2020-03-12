/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/assets/customThreejsPipelineModule.js":
/*!******************************************************!*\
  !*** ./src/js/assets/customThreejsPipelineModule.js ***!
  \******************************************************/
/*! exports provided: customThreejsPipelineModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"customThreejsPipelineModule\", function() { return customThreejsPipelineModule; });\nconst customThreejsPipelineModule = ()=>  {\n    let scene3\n    return {\n        name: 'customthreejs',\n        onStart: ({canvas, canvasWidth, canvasHeight, GLctx}) => {\n            const scene = new window.THREE.Scene()\n            const camera = new window.THREE.PerspectiveCamera(\n                60.0,  /* initial field of view; will get set based on device info later. */\n                canvasWidth / canvasHeight,\n                0.01,\n                1000.0,\n            )\n            scene.add(camera)\n\n            const renderer = new window.THREE.WebGLRenderer({\n                canvas,\n                context: GLctx,\n                alpha: false,\n                antialias: true,\n            })\n            renderer.autoClear = false\n            renderer.setSize(canvasWidth, canvasHeight)\n\n            scene3 = {scene, camera, renderer}\n        },\n        onUpdate: ({processCpuResult}) => {\n            if (!processCpuResult.reality) {\n                return\n            }\n            const {rotation, position, intrinsics} = processCpuResult.reality\n            const {camera} = scene3\n\n            for (let i = 0; i < 16; i++) {\n                camera.projectionMatrix.elements[i] = intrinsics[i]\n            }\n            // Fix for broken raycasting in r103 and higher. Related to https://github.com/mrdoob/three.js/pull/15996\n            // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before calling getInverse()\n            if (camera.projectionMatrixInverse) {\n                camera.projectionMatrixInverse.getInverse(camera.projectionMatrix)\n            }\n            if (rotation) {\n                camera.setRotationFromQuaternion(rotation)\n            }\n            if (position) {\n                camera.position.set(position.x, position.y, position.z)\n            }\n        },\n        onCanvasSizeChange: ({canvasWidth, canvasHeight}) => {\n            const {renderer} = scene3\n            renderer.setSize(canvasWidth, canvasHeight)\n        },\n        onRender: () => {\n            const {scene, renderer, camera} = scene3\n            renderer.clearDepth()\n            renderer.render(scene, camera)\n        },\n        // Get a handle to the xr scene, camera and renderer. Returns:\n        // {\n        //   scene: The Threejs scene.\n        //   camera: The Threejs main camera.\n        //   renderer: The Threejs renderer.\n        // }\n        xrScene: () => {\n            return scene3\n        },\n    }\n}\n\n//# sourceURL=webpack:///./src/js/assets/customThreejsPipelineModule.js?");

/***/ }),

/***/ "./src/js/assets/imagetarget.js":
/*!**************************************!*\
  !*** ./src/js/assets/imagetarget.js ***!
  \**************************************/
/*! exports provided: imageTargetPipelineModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"imageTargetPipelineModule\", function() { return imageTargetPipelineModule; });\n/* harmony import */ var _img_videoMarker_mp4__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./img/videoMarker.mp4 */ \"./src/js/assets/img/videoMarker.mp4\");\n/* harmony import */ var _img_marker_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./img/marker.png */ \"./src/js/assets/img/marker.png\");\n\n\nconst imageTargetPipelineModule = (customThreeJsPipeline) => {\n\n    let theScene = null\n    let theRenderer = null\n    let theCamera = null\n    let maskBox = null\n    let rotateBoxs = []\n    // let characterTextures = [];\n    let rotateBoxGroup = null\n    let maskScene\n    let postScene\n    let postCamera\n    let maskRenderTarget\n    let uniforms\n    let uniforms_video\n    let rotatePosition\n    let recordedDetail = null\n    const clock = new THREE.Clock()\n    let pointLight = null\n    let video = null;\n    let effectPlane = null;\n    let isContentsStart = false;\n\n    const initXrScene = ({scene, camera}) => {\n\n        scene.add(new THREE.AmbientLight(0x404040, 5))\n        camera.position.set(0, 3, 0)\n\n        // console.log(marker_effect)\n        const textureLoader = new THREE.TextureLoader();\n\n\n        rotatePosition = new THREE.Vector3(0,0,0)\n        clock.start()\n        postScene = new THREE.Scene()\n        maskScene = new THREE.Scene()\n        rotateBoxGroup = new THREE.Group()\n        maskBox = new THREE.Mesh(\n            new THREE.BoxGeometry(1,1,1),\n            new THREE.MeshBasicMaterial({color:0x00fc00})\n        )\n        for (let i = 0; i < 10; i++)\n        {\n            var animateBox = new THREE.Mesh(\n                new THREE.BoxGeometry(1,1,1),\n                new THREE.MeshLambertMaterial({color:new THREE.Color(0.8,0.4,1)})\n            )\n            rotateBoxs.push(animateBox)\n            rotateBoxGroup.add(animateBox)\n        }\n        rotateBoxGroup.visible = false;\n        // maskScene.add(rotateBoxGroup)\n        pointLight = new THREE.PointLight(0xffffff, 0.8)\n        maskScene.add(pointLight)\n        maskScene.add(new THREE.AmbientLight(0xffffff,0.8))\n        maskBox.visible = false\n\n        maskScene.add(maskBox)\n\n        postCamera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 2 );\n        postCamera.position.set(0,0,1)\n        maskRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight)\n        camera.position.set(0, 3, 5)\n\n        uniforms = {\n            \"source00\": { value: maskRenderTarget.texture },\n        }\n        const postScreenMat = new THREE.ShaderMaterial({\n            uniforms:uniforms,\n            transparent: true,\n            vertexShader: document.getElementById('postVert').textContent,\n            fragmentShader:document.getElementById('postFrag').textContent\n        })\n\n\n        postScene.add(new THREE.Mesh(\n            new THREE.PlaneBufferGeometry(2,2),\n            postScreenMat\n        ))\n\n        // scene.add(new THREE.AxesHelper(200))\n\n\n\n        video = document.createElement('video')\n        video.src = _img_videoMarker_mp4__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n        video.setAttribute('preload', 'auto')\n        video.setAttribute('loop', '')\n        video.setAttribute('muted', '')\n        video.setAttribute('playsinline', '')\n        video.setAttribute('webkit-playsinline', '')\n\n        const texture = new THREE.VideoTexture(video)\n        texture.minFilter = THREE.LinearFilter\n        texture.magFilter = THREE.LinearFilter\n        texture.format = THREE.RGBFormat\n        texture.crossOrigin = 'anonymous'\n\n\n        uniforms_video = {\n            \"time\":{value:1.0},\n            \"threshold\":{value:0.0},\n            \"texture\": { value: texture },\n            \"baseTexture\":{value:textureLoader.load(_img_marker_png__WEBPACK_IMPORTED_MODULE_1__[\"default\"])}\n        }\n\n        effectPlane = new THREE.Mesh(\n            new THREE.PlaneBufferGeometry(1,1),\n            new THREE.ShaderMaterial({\n                uniforms:uniforms_video,\n                transparent: true,\n                vertexShader: document.getElementById('videoEffectVert').textContent,\n                fragmentShader:document.getElementById('videoEffectFrag').textContent\n            })\n        )\n        effectPlane.visible = false;\n\n        maskScene.add(effectPlane);\n\n        video.load();\n\n    }\n\n    // Places content over image target\n    const showTarget = ({detail}) => {\n\n        if(!isContentsStart) return;\n        if (detail.name === 'marker_kanban') {\n\n            // if(isTween == false)\n            // {\n            //     console.log(uniforms_video.threshold.value);\n            //     isTween = true;\n            //     new TWEEN.Tween(uniforms_video.threshold,700)\n            //         .to({value:0.0})\n            //         .easing(TWEEN.Easing.Elastic.Out)\n            //         .onComplete(()=>{\n            //             isTween = false;\n            //         })\n            //         .onUpdate(()=>{\n            //             isTween = true;\n            //             console.log(uniforms_video.threshold.value)\n            //         })\n            //         .start()\n            // }\n\n            uniforms_video.threshold.value = Math.min(uniforms_video.threshold.value + 0.05, 1);\n\n            recordedDetail = detail\n\n            effectPlane.position.copy(detail.position)\n            effectPlane.quaternion.copy(detail.rotation)\n            effectPlane.scale.set(detail.scale*(480/640), detail.scale, 1)\n            effectPlane.visible = true\n            video.play()\n\n            pointLight.position.copy(detail.position)\n            pointLight.quaternion.copy(detail.rotation)\n            pointLight.position.add(new THREE.Vector3(0,2,0))\n            rotateBoxGroup.visible = true\n\n\n\n\n\n        }\n    }\n\n    // Hides the image frame when the target is no longer detected.\n    const hideTarget = ({detail}) => {\n\n        if (detail.name === 'marker_kanban') {\n\n            uniforms_video.threshold.value =  0;\n\n            rotateBoxGroup.visible = false\n            effectPlane.visible = false;\n            video.pause();\n\n            isContentsStart = false;\n\n\n            // animateBox.visible = false\n        }\n    }\n\n    // Grab a handle to the threejs scene and set the camera position on pipeline startup.\n    const onStart = ({canvas}) => {\n        const {scene, camera, renderer} = customThreeJsPipeline.xrScene()\n\n        canvas.addEventListener('touchstart', ()=>{\n            isContentsStart = !isContentsStart;\n        }, true)\n        theScene = scene\n        theRenderer = renderer\n        theRenderer.context.getExtension('WEBGL_debug_renderer_info')\n        theCamera = camera  // Get the 3js scene from XR\n\n        initXrScene({scene, camera}) // Add content to the scene and set starting camera position.\n\n        // Sync the xr controller's 6DoF position and camera paremeters with our scene.\n        XR8.XrController.updateCameraProjectionMatrix({\n            origin: camera.position,\n            facing: camera.quaternion,\n        })\n    }\n\n    return {\n        name: 'threejs-flyer',\n        onStart,\n\n        onUpdate: () => {\n            theCamera.updateMatrixWorld()\n            theCamera.matrixWorldInverse.getInverse(theCamera.matrixWorld)\n            theRenderer.clear(true,true,true)\n            uniforms_video.time.value = clock.getElapsedTime();\n            if(recordedDetail != null)\n            {\n                let step = Math.PI*2 / (rotateBoxs.length)\n                let count = 0\n                rotateBoxs.forEach((v)=>{\n                    v.position.copy(recordedDetail.position)\n                    v.quaternion.copy(recordedDetail.rotation)\n                    // v.scale.set(recordedDetail.scale, recordedDetail.scale*(480/640), recordedDetail.scale*0.1)\n                    // v.position.copy(recordedDetail.position)\n                    rotatePosition.set(Math.cos(count*step+clock.getElapsedTime())*recordedDetail.scale,  0,Math.sin(count*step+clock.getElapsedTime())*recordedDetail.scale)\n                    v.position.add(rotatePosition)\n                    // v.quaternion.copy(recordedDetail.rotation)\n                    // v.rotation.set(v.rotation.x+Math.sin(count*step),v.rotation.y+Math.cos((clock.getElapsedTime()*0.3+step)*Math.PI*2),v.rotation.z)\n\n                    v.scale.set(recordedDetail.scale*0.2, recordedDetail.scale*0.2, recordedDetail.scale*0.2)\n                    count++\n                })\n            }\n\n        },\n        onRender: () => {\n            theRenderer.setRenderTarget(maskRenderTarget)\n            theRenderer.clear()\n            theRenderer.render(maskScene, theCamera)\n            theRenderer.setRenderTarget(null)\n            theRenderer.state.reset()\n            theRenderer.render(postScene,postCamera)\n        },\n\n        // Listeners are called right after the processing stage that fired them. This guarantees that\n        // updates can be applied at an appropriate synchronized point in the rendering cycle.\n        listeners: [\n            {event: 'reality.imagefound', process: showTarget},\n            {event: 'reality.imageupdated', process: showTarget},\n            {event: 'reality.imagelost', process: hideTarget},\n        ],\n    }\n}\n\n\n//# sourceURL=webpack:///./src/js/assets/imagetarget.js?");

/***/ }),

/***/ "./src/js/assets/img/marker.png":
/*!**************************************!*\
  !*** ./src/js/assets/img/marker.png ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"./js/assets/marker.png\");\n\n//# sourceURL=webpack:///./src/js/assets/img/marker.png?");

/***/ }),

/***/ "./src/js/assets/img/videoMarker.mp4":
/*!*******************************************!*\
  !*** ./src/js/assets/img/videoMarker.mp4 ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"./js/assets/videoMarker.mp4\");\n\n//# sourceURL=webpack:///./src/js/assets/img/videoMarker.mp4?");

/***/ }),

/***/ "./src/js/assets/mapScene.js":
/*!***********************************!*\
  !*** ./src/js/assets/mapScene.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MapScene; });\nclass MapScene\n{\n    constructor(renderer) {\n\n\n        this.isUpdate= false;\n        this.renderer = renderer;\n        this.scene = new THREE.Scene();\n\n        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );\n        this.camera.position.z = 600;\n        //\n        const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );\n        const material = new THREE.MeshBasicMaterial( { color:0xffffff * Math.random() } );\n        this.mesh = new THREE.Mesh( geometry, material );\n\n\n\n        // const geometry = new THREE.BoxBufferGeometry();\n        // const position = geometry.attributes.position;\n        // console.log(geometry.attributes.position);\n\n\n\n        this.meshGroup = new THREE.Group();\n\n        this.meshGroup.add(this.mesh);\n\n        this.scene.add( this.meshGroup );\n\n        this.mesh.scale.set(0,0,0);\n\n        this.update = () =>{\n\n            requestAnimationFrame(this.update);\n            if(this.isUpdate)\n            {\n                this.mesh.rotation.x += 0.005;\n                this.mesh.rotation.y += 0.01;\n\n                // this.renderer.clearAlpha(0);\n                this.renderer.render( this.scene, this.camera );\n            }\n\n            // this.mesh.visible = true;\n\n\n        }\n\n\n        this.update();\n\n    }\n\n    visible()\n    {\n        this.isUpdate = true;\n        this.meshGroup.visible = true;\n        new TWEEN.Tween(this.mesh.scale,700)\n            .to(new THREE.Vector3(1,1,1))\n            .easing(TWEEN.Easing.Elastic.Out)\n            .start() // Start the tween immediately.\n\n\n        var geometriesDrawn = [];\n        var geometriesPicking = [];\n        var pickingData = [], pickingTexture, pickingScene;\n        var matrix = new THREE.Matrix4();\n        var quaternion = new THREE.Quaternion();\n        var color = new THREE.Color();\n\n        for ( var i = 0; i < 5000; i ++ ) {\n\n            var geometry = new THREE.BoxBufferGeometry();\n\n            var position = new THREE.Vector3();\n            position.x = Math.random() * 10000 - 5000;\n            position.y = Math.random() * 6000 - 3000;\n            position.z = Math.random() * 8000 - 4000;\n\n            var rotation = new THREE.Euler();\n            rotation.x = Math.random() * 2 * Math.PI;\n            rotation.y = Math.random() * 2 * Math.PI;\n            rotation.z = Math.random() * 2 * Math.PI;\n\n            var scale = new THREE.Vector3();\n            scale.x = Math.random() * 200 + 100;\n            scale.y = Math.random() * 200 + 100;\n            scale.z = Math.random() * 200 + 100;\n\n            quaternion.setFromEuler( rotation );\n            matrix.compose( position, quaternion, scale );\n\n            geometry.applyMatrix4( matrix );\n\n            // give the geometry's vertices a random color, to be displayed\n\n            this.applyVertexColors( geometry, color.setHex( Math.random() * 0xffffff ) );\n\n            geometriesDrawn.push( geometry );\n\n            geometry = geometry.clone();\n\n            // give the geometry's vertices a color corresponding to the \"id\"\n\n            this.applyVertexColors( geometry, color.setHex( i ) );\n\n            geometriesPicking.push( geometry );\n\n            pickingData[ i ] = {\n\n                position: position,\n                rotation: rotation,\n                scale: scale\n\n            };\n\n        }\n\n        var objects = new THREE.Mesh( BufferGeometryUtils.mergeBufferGeometries( geometriesDrawn ), defaultMaterial );\n        // scene.add( objects );\n    }\n\n    applyVertexColors( geometry, color ) {\n\n        var position = geometry.attributes.position;\n        var colors = [];\n\n        for ( var i = 0; i < position.count; i ++ ) {\n\n            colors.push( color.r, color.g, color.b );\n\n        }\n\n        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );\n\n    }\n\n    hide(callback)\n    {\n        new TWEEN.Tween(this.mesh.scale,700)\n        .to(new THREE.Vector3(0,0,0))\n        .easing(TWEEN.Easing.Elastic.Out)\n        .onComplete(()=>{\n            callback();\n            this.isUpdate = false;\n            this.meshGroup.visible = false;\n        })\n        .start()\n             // Start the tween immediately.\n\n    }\n}\n\n//# sourceURL=webpack:///./src/js/assets/mapScene.js?");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _assets_customThreejsPipelineModule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets/customThreejsPipelineModule */ \"./src/js/assets/customThreejsPipelineModule.js\");\n/* harmony import */ var _assets_imagetarget__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/imagetarget */ \"./src/js/assets/imagetarget.js\");\n/* harmony import */ var _assets_mapScene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets/mapScene */ \"./src/js/assets/mapScene.js\");\n\n\n\nconst myThreejsModule = Object(_assets_customThreejsPipelineModule__WEBPACK_IMPORTED_MODULE_0__[\"customThreejsPipelineModule\"])();\n\nconst onxrloaded = () => {\n    XR8.addCameraPipelineModules([  // Add camera pipeline modules.\n        // Existing pipeline modules.\n        XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.\n        myThreejsModule,                // Creates a ThreeJS AR Scene.\n        XR8.XrController.pipelineModule(),           // Enables SLAM tracking.\n        XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.\n        XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.\n        XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.\n        XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.\n        // Custom pipeline modules.\n        Object(_assets_imagetarget__WEBPACK_IMPORTED_MODULE_1__[\"imageTargetPipelineModule\"])(myThreejsModule),\n    ])\n\n    // Open the camera and start running the camera run loop.\n    XR8.run({canvas: document.getElementById('camerafeed')})\n}\n\n\n// Show loading screen before the full XR library has been loaded.\nconst load = () => { XRExtras.Loading.showLoading({onxrloaded}) }\nwindow.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }\n\n\n//# sourceURL=webpack:///./src/js/main.js?");

/***/ })

/******/ });