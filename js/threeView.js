/**
 * Created by ghassaei on 9/16/16.
 */

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: false});
var controls;

var scene2 = new THREE.Scene();
var camera2 = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 0.1, 1000);
var renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true});

var depthMaterial, effectComposer, depthRenderTarget, ssaoPass;
var dpr = 1;

function initThreeJS(){

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xa0a0a0);
    renderer.setPixelRatio(dpr);
    $("#threeDiv").append(renderer.domElement);

    renderer2.setSize( window.innerWidth, window.innerHeight );
    renderer2.setPixelRatio(dpr);
    renderer2.setClearColor(0x000000,0);
    $("#uiDiv").append(renderer2.domElement);

    scene.background = new THREE.Color(0x333333);
    scene.add(new THREE.PointLight(0x0033ff, 3, 150));
    scene.add(new THREE.AmbientLight(0x404040));// soft white light

    camera.zoom = 8;
    camera.updateProjectionMatrix();
    camera.position.z = 400;
    camera2.zoom = 8;
    camera2.updateProjectionMatrix();
    camera2.position.z = 400;

    controls = new THREE.OrbitControls(camera, renderer.domElement, function(zoom){
        camera2.zoom = zoom;
        camera2.updateProjectionMatrix();
        render2();
    });
    controls.addEventListener('change', render);
    //controls.enableZoom = false;
    controls.minZoom = 3;
	controls.maxZoom = 10;
    controls.enablePan = false;

    initPostprocessing();
}

function initPostprocessing() {

    // Setup render pass
    var renderPass = new THREE.RenderPass(scene, camera);
    //renderPass.renderToScreen = true;

    // Setup depth pass
    depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.depthPacking = THREE.RGBADepthPacking;
    depthMaterial.blending = THREE.NoBlending;

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

    // Setup SSAO pass
    ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
    ssaoPass.renderToScreen = true;
    //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
    ssaoPass.uniforms[ "tDepth" ].value = depthRenderTarget.texture;
    ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
    ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
    ssaoPass.uniforms[ 'onlyAO' ].value = true;
    ssaoPass.uniforms[ 'aoClamp' ].value = 0.3;
    ssaoPass.uniforms[ 'lumInfluence' ].value = 0.5;

    // Add pass to effect composer
    effectComposer = new THREE.EffectComposer( renderer );
    effectComposer.addPass( renderPass );
    effectComposer.addPass( ssaoPass );

}

function onWindowResizeThree() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.left = -window.innerWidth/2;
    camera.right = window.innerWidth/2;
    camera.top = window.innerHeight/2;
    camera.bottom = -window.innerHeight/2;
    camera.updateProjectionMatrix();
    camera2.aspect = window.innerWidth/window.innerHeight;
    camera2.left = -window.innerWidth/2;
    camera2.right = window.innerWidth/2;
    camera2.top = window.innerHeight/2;
    camera2.bottom = -window.innerHeight/2;
    camera2.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer2.setSize( window.innerWidth, window.innerHeight);

    //// Resize renderTargets
    //ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
    //
    //var newWidth  = Math.floor( window.innerWidth/dpr ) || 1;
    //var newHeight = Math.floor( window.innerHeight/dpr ) || 1;
    //depthRenderTarget.setSize( newWidth, newHeight );
    //effectComposer.setSize( newWidth, newHeight );

    render();
    render2();
}

function render(){
    //controls.update();
    // Render depth into depthRenderTarget
    //scene.overrideMaterial = depthMaterial;
    //renderer.render( scene, camera, depthRenderTarget, true );
    //
    //// Render renderPass and SSAO shaderPass
    //scene.overrideMaterial = null;
    //effectComposer.render();
    renderer.render(scene, camera);
}

function render2(){
    renderer2.render(scene2, camera2);
}

function sceneAdd(object){
    scene.add(object);
}

function sceneRemove(object){
    scene.remove(object);
}

function scene2Add(object){
    scene2.add(object);
}

function scene2Remove(object){
    scene2.remove(object);
}