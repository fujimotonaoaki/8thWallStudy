"use strict";
import testParticleElement from "./testParticleElement";
export default class BillboardParticle
{
    constructor(clock, simplexNoise) {

        this.clock = clock;
        this.simplexNoise = simplexNoise;
        // this.targetPosition = new THREE.Vector3(0,0,0);
        // const circleGeometry = new THREE.PlaneBufferGeometry( 1, 2 );
        // this._quaternion = new THREE.Quaternion();
        this.particleCount = 100;
        this.particles = [];
        this._scale = 1;
        this.group = new THREE.Group();
        //
        // this.translateArray = new Float32Array( this.particleCount * 3 );
        //
        this._targetPosition = new THREE.Vector3(0,0,0);
        const width = 800;
        this.uniforms = {
            "customCameraPosition":{value:new THREE.Vector3(0,0,0)}
        }

        const shaderMat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'billboardParticleVert' ).textContent,
            fragmentShader: document.getElementById( 'billboardParticleFrag' ).textContent
        })
        for ( let i = 0; i< this.particleCount; i++ ) {

            let particleElement = new testParticleElement(clock,simplexNoise);
            // let mesh = particleElement.mesh;

            // console.log(particleElement.call());

            this.particles.push(particleElement);
            this.group.add(particleElement.mesh);
        }

        this.particles.forEach((v)=>
        {
            v.call();
            v.targetPosition = new THREE.Vector3(0,0,0);
        });
        // console.log(this.particles)

    }

    get mesh()
    {
        return this.group
    }

    set targetPosition(value)
    {

        this._targetPosition.copy(value);
        // this._targetPosition.x += (value.x - this._targetPosition.x) * 0.1*this._scale;
        // this._targetPosition.y += (value.y - this._targetPosition.y) * 0.1 * this._scale;
        // this._targetPosition.z += (value.z - this._targetPosition.z) * 0.1 * this._scale;
       if(this.particles != null)
        {
            this.particles.forEach((v)=>
            {
                v.targetPosition = this._targetPosition;
            });
        }
    }

    set quaternion(value)
    {
        if(this.particles != null)
        {
            this.particles.forEach((v)=>
            {
                v.quaternion = value;
            });
        }
    }

    set scale(value)
    {
        this._scale = value;
        if(this.particles != null)
        {
            this.particles.forEach((v)=>
            {
                v.scale = value;
            });
        }
    }

    update() {


        if(this.particles != null)
        {
            this.particles.forEach((v)=>{
                v.update()
            });
        }

        // camera.viewma
    }

}