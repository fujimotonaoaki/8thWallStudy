"use strict";
// import simplex from "simplex-noise"
export default class ParticleElement
{
    set mesh(value) {
        this._mesh = value;
    }
    constructor(clock, simplexNoise) {

        this.simplex = simplexNoise;
        this.clok = clock;
        this.worldScale =1;
        this.seed = new THREE.Vector3(Math.random()*5,Math.random()*5,Math.random()*5);
        this._quaternion = new THREE.Quaternion(0,0,0,0);
        this.currenttartgetPosition = new THREE.Vector3(0,0,0);
        this.localScale = 0.01;
        this.uniforms = {
            "customCameraPosition":{value:new THREE.Vector3(0,0,0)}
        }
        const shaderMat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'billboardParticleVert' ).textContent,
            fragmentShader: document.getElementById( 'billboardParticleFrag' ).textContent
        })
        //
        const geo = new THREE.SphereBufferGeometry(1);
        const mat = new THREE.MeshBasicMaterial({color:0xf4b5ff})
        this._mesh = new THREE.Mesh(geo,shaderMat);
        //
        //
        this.initValues();
        // console.log(this.simplex)


    }

    initValues()
    {
        this._tartgetPosition = new THREE.Vector3(0,0,0)
        this.startPosition = new THREE.Vector3(0,0,0);
        this.speed = 0.01;
        this.threshold = 0.0;
        this.radius = 0.5;
        this.phi = Math.random() * Math.PI * 2;
        this.theta = Math.random() * Math.PI * 2;
        const x = this.radius * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.radius * Math.cos(this.theta);
        const z = this.radius * Math.sin(this.theta) * Math.sin(this.phi);
        this._mesh.scale.set(this.localScale,this.localScale,this.localScale);
        this._mesh.position.set(0,0,0);
        this.offsetPosition = new THREE.Vector3(x,y,z);
        this.swayRange = 0.3;
    }


    get mesh()
    {
        return this._mesh;
    }

    set targetPosition(value)
    {
        // this.startPositon = this._mesh.position;
        this._tartgetPosition.copy(value);
        // this.threshold = 0.0;
    }

    set quaternion(value)
    {
        this._quaternion.copy(value)
    }

    set scale(value)
    {

        this.worldScale = value;

    }

    call()
    {
        console.log("hello");
    }
    update()
    {

        const x = this.radius*this.worldScale * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.radius*this.worldScale * Math.cos(this.theta);
        const z = this.radius*this.worldScale * Math.sin(this.theta) * Math.sin(this.phi);
        this.offsetPosition.set(x,y,z);

        const currentPosition = this._mesh.position;

        const time = this.clok.getElapsedTime() * 0.3;
        // this.threshold = Math.max(this.threshold + this.speed,1);
        // const now = currentPosition.lerp(this.tartgetPosition,this.threshold);
        const sway = new THREE.Vector3(
            (this.simplex.noise2D(this.seed.x, time)-0.5)*this.swayRange*this.worldScale,
            (this.simplex.noise2D(this.seed.y, time)-0.5)*this.swayRange*this.worldScale,
            (this.simplex.noise2D(this.seed.z, time)-0.5)*this.swayRange*this.worldScale
        )

        const newPosition = new THREE.Vector3();

        //
        newPosition.copy(this._tartgetPosition);
        newPosition.add(this.offsetPosition);
        newPosition.add(sway);
        // now.add(sway);
        this._mesh.position.copy(newPosition);
        const diff = this.localScale*this.worldScale;
        this._mesh.quaternion.copy(this._quaternion);
        this._mesh.scale.set(diff,diff,diff);
    }
}