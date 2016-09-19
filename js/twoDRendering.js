/**
 * Created by ghassaei on 9/18/16.
 */

var profileLine;
var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 5});
var lineGeometry = new THREE.Geometry();

var vertexMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
var vertexHighlightMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
var vertexGeometry = new THREE.CircleGeometry(1,30);

var draggableVertices = [];
var highlightedVertex = null;
var selectedVertex = null;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0));

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

    if (profileLine) scene2Remove(profileLine);
    lineGeometry.vertices = _profile;
    lineGeometry.dynamic = true;
    profileLine = new THREE.Line(lineGeometry, lineMaterial);

    scene2Add(profileLine);
    render2();
}

function checkIntersections(e){

    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera2);

    if (selectedVertex){
        //find intersection with plane
        var intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);
        selectedVertex.move(intersection.x, intersection.y);
        return;
    }

    var intersections = raycaster.intersectObjects(scene2.children);

    highlightedVertex = null;

    if (intersections.length > 0) {
        _.each(intersections, function(thing){
            if (thing.object && thing.object._myVertex){
                highlightedVertex = thing.object._myVertex;
                highlightedVertex.highlight();
            } else return;
        });
    }
    if (highlightedVertex === null){
        _.each(draggableVertices, function(vertex){
            vertex.unhighlight();
        })
    }
}

function checkSelection(){
    if (highlightedVertex){
        highlightedVertex.select();
        selectedVertex = highlightedVertex;
    }
}

function deselectVertex(){
    selectedVertex.deselect();
    selectedVertex = null;
}

function DraggableVertex(position){
    this.mesh = new THREE.Mesh(vertexGeometry, vertexMaterial);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh._myVertex = this;
    scene2Add(this.mesh);
}

DraggableVertex.prototype.getPosition = function(){
    return this.mesh.position;
};

DraggableVertex.prototype.move = function(x, y){
    this.mesh.position.set(x, y, 0);
    lineGeometry.verticesNeedUpdate = true;
    render2();
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
    this.mesh.material = vertexHighlightMaterial;
    render2();
};
DraggableVertex.prototype.unhighlight = function(){
    if (this.isSelected) return;
    this.mesh.material = vertexMaterial;
    render2();
};

DraggableVertex.prototype.destroy = function(){
    scene2Remove(this.mesh);
    this.mesh._myVertex = null;
    this.mesh.position = null;
    this.mesh = null;
};