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



        // const geometry = new THREE.BoxBufferGeometry();
        // const position = geometry.attributes.position;
        // console.log(geometry.attributes.position);



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


        var geometriesDrawn = [];
        var geometriesPicking = [];
        var pickingData = [], pickingTexture, pickingScene;
        var matrix = new THREE.Matrix4();
        var quaternion = new THREE.Quaternion();
        var color = new THREE.Color();

        for ( var i = 0; i < 5000; i ++ ) {

            var geometry = new THREE.BoxBufferGeometry();

            var position = new THREE.Vector3();
            position.x = Math.random() * 10000 - 5000;
            position.y = Math.random() * 6000 - 3000;
            position.z = Math.random() * 8000 - 4000;

            var rotation = new THREE.Euler();
            rotation.x = Math.random() * 2 * Math.PI;
            rotation.y = Math.random() * 2 * Math.PI;
            rotation.z = Math.random() * 2 * Math.PI;

            var scale = new THREE.Vector3();
            scale.x = Math.random() * 200 + 100;
            scale.y = Math.random() * 200 + 100;
            scale.z = Math.random() * 200 + 100;

            quaternion.setFromEuler( rotation );
            matrix.compose( position, quaternion, scale );

            geometry.applyMatrix4( matrix );

            // give the geometry's vertices a random color, to be displayed

            this.applyVertexColors( geometry, color.setHex( Math.random() * 0xffffff ) );

            geometriesDrawn.push( geometry );

            geometry = geometry.clone();

            // give the geometry's vertices a color corresponding to the "id"

            this.applyVertexColors( geometry, color.setHex( i ) );

            geometriesPicking.push( geometry );

            pickingData[ i ] = {

                position: position,
                rotation: rotation,
                scale: scale

            };

        }

        var objects = new THREE.Mesh( BufferGeometryUtils.mergeBufferGeometries( geometriesDrawn ), defaultMaterial );
        // scene.add( objects );
    }

    applyVertexColors( geometry, color ) {

        var position = geometry.attributes.position;
        var colors = [];

        for ( var i = 0; i < position.count; i ++ ) {

            colors.push( color.r, color.g, color.b );

        }

        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

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