/**
 * Created by ghassaei on 9/18/16.
 */

var profileLines = [];
var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 5});
var highlightedLineMaterial = new THREE.LineBasicMaterial({color: 0xd9f3fc, linewidth: 5});

var vertexMaterial = new THREE.LineBasicMaterial({color: 0x6dd0f2});
var vertexHighlightMaterial = new THREE.LineBasicMaterial({color: 0xb3e7f8});
var vertexGeometry = new THREE.CircleGeometry(1,30);

var bulbMaterial = new THREE.LineBasicMaterial({color: 0xfffb9d});
var bulbHighlightMaterial = new THREE.LineBasicMaterial({color: 0xfffa84});

var draggableVertices = [];
var highlightedVertex = null;
var selectedVertex = null;

var highlightedLine = null;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0));

var calcProfileVertices;

var bulbVertex = new DraggableVertex(new THREE.Vector3(0,0,0), true);

function drawProfile(_profile){

    _.each(draggableVertices, function(_vertex){
        _vertex.destroy();
    });
    draggableVertices = [];
    _.each(_profile, function(_position, index){
        var vertex = new DraggableVertex(_position);
        draggableVertices.push(vertex);
        _profile[index] = vertex.getPosition();
    });

    _.each(profileLines, function(line){
        if (line) {
            line._highlightableLine = null;
            scene2Remove(line);
        }
    });
    profileLines = [];
    _.each(_profile, function(_position, index){
        if (index < _profile.length-1){
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices = [_position, _profile[index+1]];
            lineGeometry.dynamic = true;
            var line = new THREE.Line(lineGeometry, lineMaterial);
            line._highlightableLine = line;
            profileLines.push(line);
            scene2Add(line);
        }
    });

    render2();
}

function attachProfileChangeEvent(_calcProfileVertices){
    calcProfileVertices = _calcProfileVertices;
}

function checkIntersections(e, shouldAdd){

    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera2);

    if (selectedVertex){
        //find intersection with plane
        var intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);
        selectedVertex.move(intersection.x, intersection.y);
        calcProfileVertices();
        render2();
        return;
    }

    var intersections = raycaster.intersectObjects(scene2.children);

    highlightedVertex = null;
    highlightedLine = null;

    if (intersections.length > 0) {
        _.each(intersections, function(thing){
            if (shouldAdd){
                if (thing.object && thing.object._highlightableLine) {
                    highlightedLine = thing.object._highlightableLine;
                    highlightedLine.material = highlightedLineMaterial;
                }
            }
            if (thing.object && thing.object._myVertex){
                highlightedVertex = thing.object._myVertex;
                highlightedVertex.highlight();
            }
        });
    }
    if (highlightedLine === null){
        _.each(profileLines, function(line){
            line.material = lineMaterial;
        });
    }
    if (highlightedVertex === null){
        _.each(draggableVertices, function(vertex){
            vertex.unhighlight();
        });
        bulbVertex.unhighlight();
    }
    render2();
}

function addVertex(_profile){

    if (highlightedLine === null) return;

    var intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    //figure out at what index this vertex should go
    var index = profileLines.indexOf(highlightedLine);
    if (index<0) return;
    _profile.splice(index+1, 0, intersection);

    drawProfile(_profile);
    calcProfileVertices(true);
}


function checkSelection(){
    if (highlightedVertex){
        highlightedVertex.select();
        selectedVertex = highlightedVertex;
    }
    render2();
}

function deselectVertex(_profile){
    if (selectedVertex) {
        if (draggableVertices.length>2) {
            var intersections = raycaster.intersectObjects(scene2.children);
            if (intersections.length > 0) {
                if (draggableVertices.length > 2) {
                }
                _.each(intersections, function (thing) {
                    if (thing.object && thing.object._myVertex && thing.object._myVertex !== selectedVertex) {
                        //collapse two vertices on each other
                        var index = draggableVertices.indexOf(selectedVertex);
                        _profile.splice(index, 1);
                        draggableVertices.splice(index, 1);
                        selectedVertex.destroy();
                        selectedVertex = null;
                        drawProfile(_profile);
                        calcProfileVertices(true);
                    }
                });
            }
        }
        if (selectedVertex) selectedVertex.deselect();
    }
    selectedVertex = null;
    highlightedVertex = null;
    render2();
}

function DraggableVertex(position, isBulb){
    this.isBulb = isBulb;
    if (this.isBulb){
        var geometry = new THREE.CircleGeometry(3,30);
        this.mesh = new THREE.Mesh(geometry, bulbMaterial);
    } else {
        this.mesh = new THREE.Mesh(vertexGeometry, vertexMaterial);
    }
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh._myVertex = this;
    scene2Add(this.mesh);
}

DraggableVertex.prototype.getPosition = function(){
    return this.mesh.position;
};

DraggableVertex.prototype.move = function(x, y){
    if (this.isBulb){
        this.mesh.position.set(0, y, 0);
        updateBulbPosition(y);
    } else {
        this.mesh.position.set(x, y, 0);
        _.each(profileLines, function(line){
            line.geometry.verticesNeedUpdate = true;
            line.geometry.computeBoundingSphere();
        });
    }
};

DraggableVertex.prototype.select = function(){
    this.isSelected = true;
    this.highlight();
};

DraggableVertex.prototype.deselect = function(){
    this.isSelected = false;
    this.unhighlight();
};

DraggableVertex.prototype.highlight = function(){
    if (this.isBulb) this.mesh.material = bulbHighlightMaterial;
    else this.mesh.material = vertexHighlightMaterial;
};
DraggableVertex.prototype.unhighlight = function(){
    if (this.isSelected) return;
    if (this.isBulb) this.mesh.material = bulbMaterial;
    else this.mesh.material = vertexMaterial;
};

DraggableVertex.prototype.destroy = function(){
    scene2Remove(this.mesh);
    this.mesh._myVertex = null;
    this.mesh.position = null;
    this.mesh = null;
};