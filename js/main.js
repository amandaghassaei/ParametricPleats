/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    var numPleats = 10;
    var pleatDepth = 1;
    var flipPleatDir = false;

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

    var meshMaterial = new THREE.MeshNormalMaterial({side:THREE.DoubleSide});
    var mesh;
    rebuildMesh(profileVertices, numPleats);

    function rebuildMesh(_profileVertices, _numPleats){
        if (mesh) sceneRemove(mesh);
        var meshGeometry = makeGeometry(_profileVertices, _numPleats);
        mesh = new THREE.Mesh(meshGeometry, meshMaterial);
        sceneAdd(mesh);
        render();
    }

    function moveProfile(_profileVertices, _numPleats){
        mesh.geometry.vertices = makeVertices(_profileVertices, _numPleats);
        mesh.geometry.verticesNeedUpdate = true;
    }

    function makeGeometry(_profileVertices, _numPleats){

        var geometry = new THREE.Geometry();
        geometry.dynamic = true;

        var vertices = makeVertices(_profileVertices, _numPleats);
        var faces = [];

        for (var j=0;j<_profileVertices[0].length-1;j++){
            for (var i=0;i<_numPleats*2;i++){
                var nextI = i+1;
                if (nextI >= _numPleats*2) nextI = 0;
                faces.push(new THREE.Face3(j*_numPleats*2+i, j*_numPleats*2+nextI, (j+1)*_numPleats*2+i));
                faces.push(new THREE.Face3((j+1)*_numPleats*2+nextI, (j+1)*_numPleats*2+i, j*_numPleats*2+nextI));
            }
        }

        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeFaceNormals();
        return geometry;
    }

    function makeVertices(_profileVertices, _numPleats){
        var vertices = [];
        _.each(_profileVertices[0], function(profileVertex1, index){
            var profileVertex2 = _profileVertices[1][index];
            var angleOffset = Math.PI/numPleats;
            for (var i=0;i<_numPleats;i++){
                var angle = 2*i*Math.PI/numPleats;
                var vertex1 = new THREE.Vector3(profileVertex1.x*Math.cos(angle), profileVertex1.y, profileVertex1.x*Math.sin(angle));
                vertices.push(vertex1);
                var vertex2 = new THREE.Vector3(profileVertex2.x*Math.cos(angle+angleOffset), profileVertex2.y, profileVertex2.x*Math.sin(angle+angleOffset));
                vertices.push(vertex2);
            }
        });
        return vertices;
    }

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


});
