import computeShaderPosition from './glsl/computeShaderPosition.frag'
import computeShaderVelocity from './glsl/computeShaderVelocity.frag'
import particleFragmentShader from './glsl/particleFragmentShader.frag'
import particleVertexShader from './glsl/particleVertexShader.frag'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import * as THREE from 'three';

export default class GpuParticleManager
{

    constructor(scene, camera, renderer) {
        this.WIDTH = 4;

        this.camera = camera;
        this.scene = scene;
        this.renderer =renderer;
        this.geometry = null;

        this.PARTICLES = this.WIDTH * this.WIDTH;

        this.gpuCompute = null;
        this.velocityVariable = null;
        this.positionVariable = null;
        this.velocityUniforms = null;
        this.particleUniforms = null;
        this.effectController = null;

        this.init();
        // this.animate();

    }

    init() {

        // this.camera.position.y = 120;
        // this.camera.position.z = 400;

        // scene = new THREE.Scene();

        // renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );


        this.effectController = {
            // Can be changed dynamically
            gravityConstant: 100.0,
            density: 0.45,

            // Must restart simulation
            radius: 300,
            height: 8,
            exponent: 0.4,
            maxMass: 15.0,
            velocity: 70,
            velocityExponent: 0.2,
            randVelocity: 0.001
        };

        this.initComputeRenderer();


        this.window.addEventListener( 'resize', this.onWindowResize, false );


        this.initProtoplanets();

        this.dynamicValuesChanger();

    }

    initComputeRenderer() {

        this.gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

        const dtPosition = this.gpuCompute.createTexture();
        const dtVelocity = this.gpuCompute.createTexture();

        this.fillTextures( dtPosition, dtVelocity );

        this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", computeShaderVelocity, dtVelocity );
        this.positionVariable = this.gpuCompute.addVariable( "texturePosition", computeShaderPosition, dtPosition );

        this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );
        this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable ] );

        this.velocityUniforms = this.velocityVariable.material.uniforms;

        this.velocityUniforms[ "gravityConstant" ] = { value: 0.0 };
        this.velocityUniforms[ "density" ] = { value: 0.0 };

        const error = this.gpuCompute.init();

        if ( error !== null ) {

            console.error( error );

        }

    }

    restartSimulation(){

        const dtPosition = gpuCompute.createTexture();
        const dtVelocity = gpuCompute.createTexture();

        this.fillTextures( dtPosition, dtVelocity );

        this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 0 ] );
        this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 1 ] );
        this.gpuCompute.renderTexture( dtVelocity, this.velocityVariable.renderTargets[ 0 ] );
        this.gpuCompute.renderTexture( dtVelocity, this.velocityVariable.renderTargets[ 1 ] );

    }

    initProtoplanets (){

        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array( this.PARTICLES * 3 );
        let p = 0;

        for ( let i = 0; i < this.PARTICLES; i ++ ) {

            positions[ p ++ ] = ( Math.random() * 2 - 1 ) * this.effectController.radius;
            positions[ p ++ ] = 0; //( Math.random() * 2 - 1 ) * this.effectController.radius;
            positions[ p ++ ] = ( Math.random() * 2 - 1 ) * this.effectController.radius;

        }

        const uvs = new Float32Array( this.PARTICLES * 2 );
        p = 0;

        for ( let j = 0; j < this.WIDTH; j ++ ) {

            for ( let i = 0; i < this.WIDTH; i ++ ) {

                uvs[ p ++ ] = i / ( this.WIDTH - 1 );
                uvs[ p ++ ] = j / ( this.WIDTH - 1 );

            }

        }

        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        this.geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

        this.particleUniforms = {
            "texturePosition": { value: null },
            "textureVelocity": { value: null },
            "cameraConstant": { value: this.getCameraConstant( this.camera ) },
            "density": { value: 0.0 }
        };

        // THREE.ShaderMaterial
        const material = new THREE.ShaderMaterial( {
            uniforms: this.particleUniforms,
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader
        } );

        material.extensions.drawBuffers = true;

        const particles = new THREE.Points( this.geometry, material );
        particles.matrixAutoUpdate = false;
        particles.updateMatrix();

        this.scene.add( particles );

    }

    fillTextures( texturePosition, textureVelocity ) {

        const posArray = texturePosition.image.data;
        const velArray = textureVelocity.image.data;

        const radius = this.effectController.radius;
        const height = this.effectController.height;
        const exponent = this.effectController.exponent;
        const maxMass = this.effectController.maxMass * 1024 / this.PARTICLES;
        const maxVel = this.effectController.velocity;
        const velExponent = this.effectController.velocityExponent;
        const randVel = this.effectController.randVelocity;

        for (let k = 0, kl = posArray.length; k < kl; k += 4) {

            // Position
            let x, y, z, rr;

            do {

                x = (Math.random() * 2 - 1);
                z = (Math.random() * 2 - 1);
                rr = x * x + z * z;

            } while (rr > 1);

            rr = Math.sqrt(rr);

            const rExp = radius * Math.pow(rr, exponent);

            // Velocity
            const vel = maxVel * Math.pow(rr, velExponent);

            const vx = vel * z + (Math.random() * 2 - 1) * randVel;
            const vy = (Math.random() * 2 - 1) * randVel * 0.05;
            const vz = -vel * x + (Math.random() * 2 - 1) * randVel;

            x *= rExp;
            z *= rExp;
            y = (Math.random() * 2 - 1) * height;

            const mass = Math.random() * maxMass + 1;

            // Fill in texture values
            posArray[k + 0] = x;
            posArray[k + 1] = y;
            posArray[k + 2] = z;
            posArray[k + 3] = 1;

            velArray[k + 0] = vx;
            velArray[k + 1] = vy;
            velArray[k + 2] = vz;
            velArray[k + 3] = mass;

        }
    }


    onWindowResize () {

        // this.camera.aspect = window.innerWidth / window.innerHeight;
        // this.camera.updateProjectionMatrix();

        // this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.particleUniforms["cameraConstant"].value = this.getCameraConstant(this.camera);

    }

    dynamicValuesChanger() {

        this.velocityUniforms["gravityConstant"].value = this.effectController.gravityConstant;
        this.velocityUniforms["density"].value = this.effectController.density;
        this.particleUniforms["density"].value = this.effectController.density;

    }

    getCameraConstant( camera ) {

        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );

    }

    update() {

        this.render();

    }

    render() {

        this.gpuCompute.compute();

        this.particleUniforms[ "texturePosition" ].value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
        this.particleUniforms[ "textureVelocity" ].value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;

        // this.renderer.render( scene, camera );

    }




}