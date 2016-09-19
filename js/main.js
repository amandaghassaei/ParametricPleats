/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    var numPleats = 10;
    var pleatDepth = 1;
    var flipPleatDir = false;

    var profile = [
        new THREE.Vector3(-10, 20, 0),
        new THREE.Vector3(-10, 15, 0),
        new THREE.Vector3(-18, 0, 0),
        new THREE.Vector3(-5, -20, 0)
    ];

    var profileVertices = [
        [
            new THREE.Vector3(-10, 20, 0),
            new THREE.Vector3(-10, 15, 0),
            new THREE.Vector3(-18, 0, 0),
            new THREE.Vector3(-5, -20, 0)
        ],
        [
            new THREE.Vector3(-9, 20, 0),
            new THREE.Vector3(-10, 13, 0),
            new THREE.Vector3(-17, 0.5, 0),
            new THREE.Vector3(-4, -20, 0)
        ]

    ];

    rebuildMesh(profileVertices, numPleats);

    drawProfile(profile);


    var numPleatsSlider = $("#numPleats").slider({
        orientation: 'horizontal',
        range: false,
        value: numPleats,
        min: 3,
        max: 200,
        step: 1
    });

    var pleatDepthSlider = $("#pleatDepth").slider({
        orientation: 'horizontal',
        range: false,
        value: pleatDepth,
        min: 0.5,
        max: 10,
        step: 0.05
    });

    numPleatsSlider.on("slide", function(){
        numPleats = numPleatsSlider.slider('value');
        rebuildMesh(profileVertices, numPleats);
    });

    window.addEventListener( 'mousemove', mouseMove, false );
    window.addEventListener( 'mousedown', mouseDown, false );
    window.addEventListener( 'mouseup', mouseUp, false );

    function mouseMove(e){
        e.preventDefault();
        checkIntersections(e);
    }

    function mouseUp(e){
        e.preventDefault();
        deselectVertex();
    }

    function mouseDown(e){
        e.preventDefault();
        checkSelection();
    }

});
