/**
 * Created by ghassaei on 9/16/16.
 */


$(function() {

    initThreeJS();

    var numPleats = 30;
    var pleatDepth = 4;
    var flipPleatDir = false;

    var shouldAddVertex = false;
    var justAddedVertex = false;
    var $addVertexDiv = $("#newVertex");

    var rawProfile = [
        new THREE.Vector3(-10, 20, 0),
        new THREE.Vector3(-10, 15, 0),
        new THREE.Vector3(-18, 0, 0),
        new THREE.Vector3(-5, -20, 0)
    ];

    var profile = [
        new THREE.Vector3(-10, 20, 0),
        new THREE.Vector3(-10, 15, 0),
        new THREE.Vector3(-18, 0, 0),
        new THREE.Vector3(-5, -20, 0)
    ];
    var profileVertices;

    var svg;
    $("#svgDiv").svg({onLoad: function(_svg){svg = _svg;}});//svg renderer

    function calcProfileVertices(shouldRebuild){

        var vertices1 = [];
        var vertices2 = [];

        _.each(profile, function(vertex){
            vertices1.push(new THREE.Vector3(vertex.x+pleatDepth/2, vertex.y, 0));
            vertices2.push(new THREE.Vector3(vertex.x-pleatDepth/2, vertex.y, 0));
        });

        profileVertices = [vertices1, vertices2];

        if (shouldRebuild){
            rebuildMesh(profileVertices, numPleats);
        } else {
            moveProfile(profileVertices, numPleats);
        }
    }

    calcProfileVertices();

    rebuildMesh(profileVertices, numPleats);
    drawProfile(profile);
    attachProfileChangeEvent(calcProfileVertices);


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

    pleatDepthSlider.on("slide", function(){
        pleatDepth = pleatDepthSlider.slider('value');
        calcProfileVertices(profile);
        rebuildMesh(profileVertices, numPleats);
    });

    window.addEventListener( 'mousemove', mouseMove, false );
    window.addEventListener( 'mousedown', mouseDown, false );
    window.addEventListener( 'mouseup', mouseUp, false );

    function mouseMove(e){
        e.preventDefault();

        if (shouldAddVertex){
            $addVertexDiv.show();
            $addVertexDiv.css({
                left:  e.pageX-15,
                top:   e.pageY-15
            });
        }

        checkIntersections(e, shouldAddVertex);
    }

    function mouseUp(e){
        e.preventDefault();
        if (justAddedVertex) {
            justAddedVertex = false;
        } else {
            deselectVertex(profile);
        }

        controls.reset();
        render();
    }

    function mouseDown(e){
        e.preventDefault();
        if (shouldAddVertex){
            addVertex(profile, e);
            shouldAddVertex = false;
            justAddedVertex = true;
            $addVertexDiv.hide();
        } else {
            checkSelection();
        }

    }

    $('#addVertexMode').click(function(e){
        e.preventDefault();
        shouldAddVertex = true;
    });

    $("#download").click(function(e){
        e.preventDefault();
        saveSVG();
    });

    function saveSVG(){
        $("svg").html("");//clear svg tag from last draw
        var score = svg.group({stroke: 'black', strokeWidth: 1, strokeDashArray:"2, 2"});
        var solid = svg.group({stroke: 'black', strokeWidth: 1});
        var margin = 30;
        var scale = 2;
        var _pleatDepth = pleatDepth*scale;
        for (var i=0;i<=2*numPleats;i++){
            var group = score;
            if (i==0 || i== 2*numPleats) group = solid;
            svg.line(group, margin+i*_pleatDepth, margin, margin+i*_pleatDepth, 500+margin);
        }
        svg.line(solid, margin, margin, margin+numPleats*_pleatDepth*2, margin);
        svg.line(solid, margin, 500+margin, margin+numPleats*_pleatDepth*2, 500+margin);
        //_.each(profile, function(vertex, index){
        //    if (index<rawProfile.length-1){
        //        svg.line(g, vertex.x+200, -vertex.y+200, rawProfile[index+1].x+200, -rawProfile[index+1].y+200);
        //    }
        //});
        var svgData = $("svg")[0].outerHTML;
        var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "lamp.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }



});
