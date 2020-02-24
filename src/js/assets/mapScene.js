export default class MapScene
{
    constructor(renderer) {


        this.isUpdate= false;
        this.renderer = renderer;
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 600;
        //
        const geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
        const material = new THREE.MeshBasicMaterial( { color:0xffffff * Math.random() } );
        this.mesh = new THREE.Mesh( geometry, material );



        this.meshGroup = new THREE.Group();

        this.meshGroup.add(this.mesh);

        this.scene.add( this.meshGroup );

        this.mesh.scale.set(0,0,0);

        this.update = () =>{

            requestAnimationFrame(this.update);
            if(this.isUpdate)
            {
                this.mesh.rotation.x += 0.005;
                this.mesh.rotation.y += 0.01;

                // this.renderer.clearAlpha(0);
                this.renderer.render( this.scene, this.camera );
            }

            // this.mesh.visible = true;


        }


        this.update();

    }

    visible()
    {
        this.isUpdate = true;
        this.meshGroup.visible = true;
        new TWEEN.Tween(this.mesh.scale,700)
            .to(new THREE.Vector3(1,1,1))
            .easing(TWEEN.Easing.Elastic.Out)
            .start() // Start the tween immediately.

    }

    hide(callback)
    {
        new TWEEN.Tween(this.mesh.scale,700)
        .to(new THREE.Vector3(0,0,0))
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(()=>{
            callback();
            this.isUpdate = false;
            this.meshGroup.visible = false;
        })
        .start()
             // Start the tween immediately.

    }
}