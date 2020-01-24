varying vec2 vUv;

uniform float time;
uniform sampler2D source00;

void main()	{

    vec4 sourceColor = texture2D( source00, vUv );
    if(distance(sourceColor.xyz, vec3(0.0, 252.0/255.0, 0.0)) < 0.2) sourceColor.a = 0.0;

    gl_FragColor = sourceColor;//vec4( vUv.x,1,vUv.y,1);

}