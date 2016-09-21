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
        drawSVG();
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

    function drawSVG(){
        var rawProfile = profile;
        $("svg").html("");//clear svg tag from last draw
        var scoreSettings = {stroke: 'black', fill: 'none', strokeWidth: 1, strokeDashArray:"2, 2"};
        var score = svg.group(scoreSettings);
        var solid = svg.group({stroke: 'black', fill: 'none', strokeWidth: 1});
        var margin = 30;
        var scale = 2;
        var _pleatDepth = pleatDepth*scale;
        svg.line(solid, margin, margin, margin+numPleats*_pleatDepth*2, margin);
        var yOffset = 0;
        _.each(rawProfile, function(vertex, index){
            if (index>0 && index<rawProfile.length-1){
                var v1 = vertex.clone().sub(rawProfile[index-1]);
                var v2 = vertex.clone().sub(rawProfile[index+1]).normalize();

                yOffset+= v1.length()*10;
                v1.normalize();

                var theta = Math.acos(v1.dot(v2));
                var sign = v1.clone().cross(v2).z > 0 ? 1 : -1;//sign of theta
                sign = index%2==0 ? sign*-1 : sign;//phase alternates on every index

                var thetaSmall = (Math.PI-theta)/2;
                var deltaY = _pleatDepth/(2*Math.tan(thetaSmall));
                var polyLineVertices = [];
                for (var i=0;i<=2*numPleats;i++){
                    if (i%2==0) polyLineVertices.push([margin+i*_pleatDepth, margin+yOffset+sign*deltaY]);
                    else polyLineVertices.push([margin+i*_pleatDepth, margin+yOffset-sign*deltaY]);
                }
                svg.polyline(polyLineVertices, scoreSettings);
            } else if (index == rawProfile.length-1){
                var v1 = vertex.clone().sub(rawProfile[index-1]);
                yOffset+= v1.length()*10;
            }
        });
        for (var i=0;i<=2*numPleats;i++){
            var group = score;
            if (i==0 || i== 2*numPleats) group = solid;
            svg.line(group, margin+i*_pleatDepth, margin, margin+i*_pleatDepth, yOffset+margin);
        }
        svg.line(solid, margin, yOffset+margin, margin+numPleats*_pleatDepth*2, yOffset+margin);
    }

    function saveSVG(){
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
