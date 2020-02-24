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

/***/ "./src/js/assets/mapScene.js":
/*!***********************************!*\
  !*** ./src/js/assets/mapScene.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MapScene; });\nclass MapScene\n{\n    constructor(renderer) {\n\n\n        this.isUpdate= false;\n        this.renderer = renderer;\n        this.scene = new THREE.Scene();\n\n        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );\n        this.camera.position.z = 600;\n        //\n        const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );\n        const material = new THREE.MeshBasicMaterial( { color:0xffffff * Math.random() } );\n        this.mesh = new THREE.Mesh( geometry, material );\n\n\n\n        this.meshGroup = new THREE.Group();\n\n        this.meshGroup.add(this.mesh);\n\n        this.scene.add( this.meshGroup );\n\n        this.mesh.scale.set(0,0,0);\n\n        this.update = () =>{\n\n            requestAnimationFrame(this.update);\n            if(this.isUpdate)\n            {\n                this.mesh.rotation.x += 0.005;\n                this.mesh.rotation.y += 0.01;\n\n                // this.renderer.clearAlpha(0);\n                this.renderer.render( this.scene, this.camera );\n            }\n\n            // this.mesh.visible = true;\n\n\n        }\n\n\n        this.update();\n\n    }\n\n    visible()\n    {\n        this.isUpdate = true;\n        this.meshGroup.visible = true;\n        new TWEEN.Tween(this.mesh.scale,700)\n            .to(new THREE.Vector3(1,1,1))\n            .easing(TWEEN.Easing.Elastic.Out)\n            .start() // Start the tween immediately.\n\n    }\n\n    hide(callback)\n    {\n        new TWEEN.Tween(this.mesh.scale,700)\n        .to(new THREE.Vector3(0,0,0))\n        .easing(TWEEN.Easing.Elastic.Out)\n        .onComplete(()=>{\n            callback();\n            this.isUpdate = false;\n            this.meshGroup.visible = false;\n        })\n        .start()\n             // Start the tween immediately.\n\n    }\n}\n\n//# sourceURL=webpack:///./src/js/assets/mapScene.js?");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _assets_customThreejsPipelineModule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets/customThreejsPipelineModule */ \"./src/js/assets/customThreejsPipelineModule.js\");\n/* harmony import */ var _assets_mapScene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/mapScene */ \"./src/js/assets/mapScene.js\");\n\n\nconst myThreejsModule = Object(_assets_customThreejsPipelineModule__WEBPACK_IMPORTED_MODULE_0__[\"customThreejsPipelineModule\"])();\nlet theRenderer;\nlet isMapScene = false;\nlet mapScene;\nconst crossFadeSlider = {value:0.0};\nconst placegroundScenePipelineModule = () => {\n    const modelFile = 'tree.glb'                                 // 3D model to spawn at tap\n    const startScale = new THREE.Vector3(0.0001, 0.0001, 0.0001) // Initial scale value for our model\n    const endScale = new THREE.Vector3(0.002, 0.002, 0.002)      // Ending scale value for our model\n    const animationMillis = 750                                  // Animate over 0.75 seconds\n    const orthoCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );\n    orthoCamera.position.set(0,0,1)\n    const fadeScene = new THREE.Scene();\n    const fadePlane = new THREE.Mesh(\n        new THREE.PlaneGeometry(2,2),\n        new THREE.MeshBasicMaterial({color:0xffffff,transparent:true, opacity:0.0})\n    );\n    fadePlane.rotateX(0);\n    fadeScene.add(fadePlane);\n\n\n    let isUpdateFadeScene = false;\n\n    const raycaster = new THREE.Raycaster()\n    const tapPosition = new THREE.Vector2()\n    const loader = new THREE.GLTFLoader()  // This comes from GLTFLoader.js.\n\n    let surface  // Transparent surface for raycasting for object placement.\n\n    // Populates some object into an XR scene and sets the initial camera position. The scene and\n    // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.\n    const initXrScene = ({ scene, camera }) => {\n\n        console.log('initXrScene')\n        surface = new THREE.Mesh(\n            new THREE.PlaneGeometry( 100, 100, 1, 1 ),\n            new THREE.MeshBasicMaterial({\n                color: 0xffff00,\n                transparent: true,\n                opacity: 0.0,\n                side: THREE.DoubleSide\n            })\n        )\n\n        surface.rotateX(-Math.PI / 2)\n        surface.position.set(0, 0, 0)\n        scene.add(surface)\n\n        scene.add(new THREE.AmbientLight( 0x404040, 5 ))  // Add soft white light to the scene.\n\n        // Set the initial camera position relative to the scene we just laid out. This must be at a\n        // height greater than y=0.\n        camera.position.set(0, 3, 0)\n    }\n\n    const animateIn = (model, pointX, pointZ, yDegrees) => {\n        console.log(`animateIn: ${pointX}, ${pointZ}, ${yDegrees}`)\n        const scale = Object.assign({}, startScale)\n\n        model.scene.rotation.set(0.0, yDegrees, 0.0)\n        model.scene.position.set(pointX, 0.0, pointZ)\n        model.scene.scale.set(scale.x, scale.y, scale.z)\n        myThreejsModule.xrScene().scene.add(model.scene)\n\n        new TWEEN.Tween(scale)\n            .to(endScale, animationMillis)\n            .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.\n            .onUpdate(() => { model.scene.scale.set(scale.x, scale.y, scale.z) })\n            .start() // Start the tween immediately.\n    }\n\n    // Load the glb model at the requested point on the surface.\n    const placeObject = (pointX, pointZ) => {\n        console.log(`placing at ${pointX}, ${pointZ}`)\n        loader.load(\n            modelFile,                                                              // resource URL.\n            (gltf) => { animateIn(gltf, pointX, pointZ, Math.random() * 360) },     // loaded handler.\n            (xhr) => {console.log(`${(xhr.loaded / xhr.total * 100 )}% loaded`)},   // progress handler.\n            (error) => {console.log('An error happened')}                           // error handler.\n        )\n    }\n\n    const placeObjectTouchHandler = (e) => {\n\n\n        var duration = 1000;\n        // XR8.pause();\n        isMapScene = !isMapScene;\n\n        if(isMapScene)\n        {\n            isUpdateFadeScene = true;\n            new TWEEN.Tween(crossFadeSlider)\n                .to({value:1},duration)\n                .onUpdate(()=>{fadePlane.material.opacity = crossFadeSlider.value;})\n                .onComplete(()=>{\n                mapScene.visible();\n                XR8.pause();\n            }).start();\n        } else\n        {\n\n\n            mapScene.hide(()=>{\n\n                XR8.resume();\n                new TWEEN.Tween(crossFadeSlider)\n                    .to({value:0},duration)\n                    .onUpdate(()=>{fadePlane.material.opacity = crossFadeSlider.value;})\n                    .onComplete(()=>{isUpdateFadeScene = false})\n                    .start();\n            });\n        }\n        console.log('placeObjectTouchHandler')\n        // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the\n        // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.\n        if (e.touches.length == 2) {\n            XR8.XrController.recenter()\n        }\n\n        if (e.touches.length > 2) {\n            return\n        }\n\n        // If the canvas is tapped with one finger and hits the \"surface\", spawn an object.\n        const {scene, camera} = myThreejsModule.xrScene()\n\n        // calculate tap position in normalized device coordinates (-1 to +1) for both components.\n        tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1\n        tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1\n\n        // Update the picking ray with the camera and tap position.\n        raycaster.setFromCamera(tapPosition, camera)\n\n        // Raycast against the \"surface\" object.\n        const intersects = raycaster.intersectObject(surface)\n\n        if (intersects.length == 1 && intersects[0].object == surface) {\n            placeObject(intersects[0].point.x, intersects[0].point.z)\n        }\n    }\n\n    return {\n        // Pipeline modules need a name. It can be whatever you want but must be unique within your app.\n        name: 'placeground',\n\n        // onStart is called once when the camera feed begins. In this case, we need to wait for the\n        // XR8.Threejs scene to be ready before we can access it to add content. It was created in\n        // XR8.Threejs.pipelineModule()'s onStart method.\n        onStart: ({canvas, canvasWidth, canvasHeight}) => {\n            const {scene, camera, renderer} = myThreejsModule.xrScene()  // Get the 3js sceen from xr3js.\n            theRenderer = renderer;\n            mapScene = new _assets_mapScene__WEBPACK_IMPORTED_MODULE_1__[\"default\"](theRenderer);\n            initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.\n\n            canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.\n\n            // Enable TWEEN animations.\n            animate()\n            function animate(time) {\n                requestAnimationFrame(animate)\n                TWEEN.update(time)\n            }\n\n            // Sync the xr controller's 6DoF position and camera paremeters with our scene.\n            XR8.XrController.updateCameraProjectionMatrix({\n                origin: camera.position,\n                facing: camera.quaternion,\n            })\n        },\n        onRender: () => {\n\n            if(isUpdateFadeScene)theRenderer.render(fadeScene,orthoCamera);\n\n        },\n    }\n}\n\nconst onxrloaded = () => {\n    XR8.addCameraPipelineModules([  // Add camera pipeline modules.\n        // Existing pipeline modules.\n        XR8.GlTextureRenderer.pipelineModule(),      // Draws the camera feed.\n        myThreejsModule,                // Creates a ThreeJS AR Scene.\n        XR8.XrController.pipelineModule(),           // Enables SLAM tracking.\n        XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.\n        XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.\n        XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.\n        XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.\n        // Custom pipeline modules.\n        placegroundScenePipelineModule(),\n    ])\n\n    // Open the camera and start running the camera run loop.\n    XR8.run({canvas: document.getElementById('camerafeed')})\n}\n\n// Show loading screen before the full XR library has been loaded.\nconst load = () => { XRExtras.Loading.showLoading({onxrloaded}) }\nwindow.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }\n\n//# sourceURL=webpack:///./src/js/main.js?");

/***/ })

/******/ });