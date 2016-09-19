/**
 * Created by ghassaei on 9/16/16.
 */

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var controls;

var scene2 = new THREE.Scene();
var camera2 = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 0.1, 1000);
//var camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer2 = new THREE.WebGLRenderer({ alpha: true });

function initThreeJS(){

    renderer.setSize( window.innerWidth, window.innerHeight );
    $("#threeDiv").append(renderer.domElement);

    renderer2.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000,0);
    $("#uiDiv").append(renderer2.domElement);

    scene.background = new THREE.Color( 0xffffff );

    camera.zoom = 8;
    camera.updateProjectionMatrix();
    camera.position.z = 40;
    camera2.zoom = 8;
    camera2.updateProjectionMatrix();
    camera2.position.z = 40;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.enableZoom = false;
    controls.enablePan = false;

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();

    renderer2.setSize( window.innerWidth, window.innerHeight );
}

function render(){
    //controls.update();
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