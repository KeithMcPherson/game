
var world, physicsMaterial, balls=[], ballMeshes=[];
var trees = [];

var zones = [];
var currentZoneX;
var currentZoneZ;


var camera, scene, renderer;
var geometry, material, mesh;
var controls,time = Date.now();

var element = document.body;

var dt=1/60;
var ZONE_SIZE = 50;
var NUM_TREES = 10;

window.onload = function () {
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var pointerlockchange = function ( event ) {

            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                //KRM
                //controls.enabled = true;
                //blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        }

        var pointerlockerror = function ( event ) {
            instructions.style.display = '';
        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', gameSetup, false ); //KRM

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }

    initCannon();
    init();
    animate();

}
function beginWorld() {
    element = document.body;

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

        var fullscreenchange = function ( event ) {

            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                element.requestPointerLock();
            }

        }

        document.addEventListener( 'fullscreenchange', fullscreenchange, false );
        document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

        element.requestFullscreen();
    } else {

        element.requestPointerLock();

    }
}



function initCannon(){
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    //world.gravity.set(0,-9.8,0);
    world.gravity.set(0,-9.8,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.1, // friction coefficient
                                                            0.3  // restitution
                                                            );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create a sphere
    world.add(player.body);

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.RigidBody(0,groundShape,physicsMaterial);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.add(groundBody);
}

function init() {

    camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.1, ZONE_SIZE );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xdddddd, 0, ZONE_SIZE ); //KRM adjust

    var ambient = new THREE.AmbientLight( 0x333333 );
    scene.add( ambient );

    light = new THREE.SpotLight( 0xffffff );
    light.position.set( 10, 30, 20 );
    light.target.position.set( 0, 0, 0 );
    if(true){
        light.castShadow = true;

        light.shadowCameraNear = 20;
        light.shadowCameraFar = 50;//camera.far;
        light.shadowCameraFov = 40;

        light.shadowMapBias = 0.1;
        light.shadowMapDarkness = 0.7;
        light.shadowMapWidth = window.innerWidth;
        light.shadowMapHeight = window.innerHeight;

        //light.shadowCameraVisible = true;
    }
    scene.add( light );


    controls = new PointerLockControls( camera , player.body );
    scene.add( controls.getObject() );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color, 1 );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    changeZone(0, 0);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    requestAnimationFrame( animate );
    if(controls.enabled){
        world.step(dt);
        drawUI();
        checkChangeZone();

        //clear out interact text
        $('#interact').html("");
        delete player.interactObject;

        for (var zoneIndex=0; zoneIndex<zones.length; zoneIndex++) {
            // Update ball positions
            for(var i=0; i<balls.length; i++){
                balls[i].position.copy(ballMeshes[i].position);
                balls[i].quaternion.copy(ballMeshes[i].quaternion);
            }

            // Update object positions
            for(var i=0; i<zones[zoneIndex].envObjects.length; i++){
                zones[zoneIndex].envObjects[i].body.position.copy(zones[zoneIndex].envObjects[i].mesh.position);
                zones[zoneIndex].envObjects[i].body.quaternion.copy(zones[zoneIndex].envObjects[i].mesh.quaternion);
                
                //if you can interact with it
                if (zones[zoneIndex].envObjects[i].hasOwnProperty('interact')) { 
                    if (player.body.position.distanceTo(zones[zoneIndex].envObjects[i].body.position) < 3) {
                        var angle = Math.atan2(zones[zoneIndex].envObjects[i].body.position.z - player.body.position.z, zones[zoneIndex].envObjects[i].body.position.x - player.body.position.x) * 180 / Math.PI;
                        angle +=90;
                        var rotAngle = (controls.getObject().rotation.y) * 180 / Math.PI;
                        angle += rotAngle;
                        angle = angle % 360;
                        if (angle < 30) {
                            var vector = projector.projectVector(zones[zoneIndex].envObjects[i].mesh.position.clone(), camera);
                            vector.x = (vector.x + 1)/2 * window.innerWidth;
                            vector.y = -(vector.y - 1)/2 * window.innerHeight;

                            //set interact text and location
                            $('#interact').html("Press E to Interact");
                            $('#interact').css("top", vector.y + 'px');
                            $('#interact').css("left", vector.x-100 + 'px');

                            player.interactObject = zones[zoneIndex].envObjects[i];
                        }
                    }
                }
            }
        }
    }

    controls.update( Date.now() - time );
    renderer.render( scene, camera );
    time = Date.now();

}

var ballShape = new CANNON.Sphere(0.1);
var ballGeometry = new THREE.SphereGeometry(ballShape.radius);
var shootDirection = new THREE.Vector3();
var projector = new THREE.Projector();
function getShootDir(targetVec){
    var vector = targetVec;
    targetVec.set(0,0,1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(player.body.position, vector.sub(player.body.position).normalize() );
    targetVec.x = ray.direction.x;
    targetVec.y = ray.direction.y;
    targetVec.z = ray.direction.z;
}

window.addEventListener("click",function(e){ 
    if(controls.enabled==true){
        if (player.leftSpell.projectileType==SINGLE) {
            var x = player.body.position.x;
            var y = player.body.position.y;
            var z = player.body.position.z;
            var ballBody = new CANNON.RigidBody(player.leftSpell.mass,ballShape);
            var ballMesh = new THREE.Mesh( ballGeometry, getSpellMaterial(player.leftSpell.damageType) );
            world.add(ballBody);
            scene.add(ballMesh);
            ballMesh.castShadow = true;
            ballMesh.receiveShadow = true;
            balls.push(ballBody);
            ballMeshes.push(ballMesh);
            getShootDir(shootDirection);
            ballBody.velocity.set(  shootDirection.x * player.leftSpell.velocity,
                                    shootDirection.y * player.leftSpell.velocity,
                                    shootDirection.z * player.leftSpell.velocity);
            // Move the ball outside the player sphere
            x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
            y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
            z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
            ballBody.position.set(x,y,z);
            ballMesh.position.set(x,y,z);
            ballBody.motionstate = 4; //kinematic so it moves without gravity
        }
    }
});


//KRM below
//function generateTrees(originX, originZ, zoneIndex) {
function generateTrees() {
    //KRM add zones[zoneIndex].envObjects
    for(var i=0; i<NUM_TREES*9; i++){

        var offset = (Math.random()-.5)*.2;

        var tree = new Tree({"seed":Math.random()*1000,
        "segments":10,
        "levels":5,
        "vMultiplier":0.66+offset,
        "twigScale":0.47,
        "initalBranchLength":0.5+offset,
        "lengthFalloffFactor":0.85,
        "lengthFalloffPower":0.99,
        "clumpMax":0.449,
        "clumpMin":0.404,
        "branchFactor":2.75+offset,
        "dropAmount":0.07,
        "growAmount":-0.005,
        "sweepAmount":0.01,
        "maxRadius":0.269+offset,
        "climbRate":0.626+offset,
        "trunkKink":0.108,
        "treeSteps":4,
        "taperRate":0.876,
        "radiusFalloffRate":0.66,
        "twistRate":2.7+offset,
        "trunkLength":1.55+offset,
        "trunkMaterial":"TrunkType2",
        "twigMaterial":"BranchType5"});

        /*var tree = new Tree({"seed":900,
        "segments":10,
        "levels":5,
        "vMultiplier":0.66,
        "twigScale":0.47,
        "initalBranchLength":0.5,
        "lengthFalloffFactor":0.85,
        "lengthFalloffPower":0.99,
        "clumpMax":0.449,
        "clumpMin":0.404,
        "branchFactor":2.75,
        "dropAmount":0.07,
        "growAmount":-0.005,
        "sweepAmount":0.01,
        "maxRadius":0.269,
        "climbRate":0.626,
        "trunkKink":0.108,
        "treeSteps":4,
        "taperRate":0.876,
        "radiusFalloffRate":0.66,
        "twistRate":2.7,
        "trunkLength":1.55,
        "trunkMaterial":"TrunkType2",
        "twigMaterial":"BranchType5"});*/

        var texturepath = 0;

        var model = {
          "metadata" : {
          "formatVersion" : 3.1,
          "generatedBy" : "bb3d2proctree",
          "vertices"        : 0,
          "faces"           : 0,
          "description" : "Autogenerated from proctree."
          },
          "materials": [{"mapDiffuse":"images/tree/oakbark.jpg",
          "diffuse": 20000
          }],
          "colors": [0xff00ff, 0xff0000] // just testing
        };

        model.vertices = Tree.flattenArray(tree.verts);
        model.normals  = Tree.flattenArray(tree.normals);
        model.uvs      = [Tree.flattenArray(tree.UV)];
        //console.log(tree.UV);
        // model.faces    = Tree.flattenArray(tree.faces);
        model.faces    = [];
        for (var j = 0; j < tree.faces.length; j++) {
          var face = tree.faces[j];
          model.faces.push(0);
          model.faces.push(face[0]); // v1
          model.faces.push(face[1]); // v2
          model.faces.push(face[2]); // v3
        } 
        
        var loader = new THREE.JSONLoader();
        var treeModel = loader.parse(model);
        //console.log(treeModel);
        createTree(treeModel.geometry, treeModel.materials);
        function createTree(geometry, materials) {
            //console.log(geometry);

            //console.log(materials);
            // var mesh = new THREE.Mesh( geometry, materials[0]);
            mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0x966f33}));
            //mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0x966f33,map:THREE.ImageUtils.loadTexture( "images/tree/oakbark.jpg" )}));

            var halfExtents = new CANNON.Vec3(.25,2,.25);
            var boxShape = new CANNON.Box(halfExtents);
            var boxBody = new CANNON.RigidBody(1000,boxShape); //first is mass
            //var boxMesh = new THREE.Mesh( boxGeometry, material );
            //world.add(boxBody);
            //This moves the origin so that it matches witht he physics body
            mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, -2, 0) ); //must match halfextent y
            //scene.add(mesh);
            //boxBody.position.set(x,y,z); //make these the same as halfextent y
            //mesh.position.set(x,y,z); //make these the same as halfextent y
            mesh.castShadow = true;
            //mesh.receiveShadow = true;
            trees.push({"body":boxBody, "mesh":mesh, "type":"tree"});
            //zones[zoneIndex].envObjectMeshes.push(mesh);
            //scene.add(mesh);

            mesh.updateMatrix();
        }
    }   

    /*bird = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
    bird.position.set(1,4,1);
    bird.castShadow = true;
    //mesh.receiveShadow = true;
    bird.scale.set(.1,.1,.1)
    zones[zoneIndex].envObjectMeshes.push(bird);
    var halfExtents = new CANNON.Vec3(.25,.25,.25);
    var boxShape = new CANNON.Box(halfExtents);
    var boxBody = new CANNON.RigidBody(5,boxShape); //first is mass
    zones[zoneIndex].envObjects.push(boxBody);
    world.add(boxBody)
    scene.add(bird);*/
}

function addTrees(originX, originZ, zoneIndex) {
    for(var i=0; i<NUM_TREES; i++){
        var x = (Math.random()-0.5)*ZONE_SIZE+originX;
        var y = 2;
        var z = (Math.random()-0.5)*ZONE_SIZE+originZ;

        zones[zoneIndex].envObjects.push(trees[0]);
        trees.splice(0, 1);

        zones[zoneIndex].envObjects[i].body.position.set(x,y,z); //make these the same as halfextent y
        zones[zoneIndex].envObjects[i].mesh.position.set(x,y,z); //make these the same as halfextent y

        scene.add(zones[zoneIndex].envObjects[i].mesh);
        world.add(zones[zoneIndex].envObjects[i].body);


    }
}

function generateRelicSite(originX, originZ, zoneIndex) {
    var mass = 150;
    var columnOffset = 6;
    var columnLength = 2;
    var stoneMaterial = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
    //THREE.ColorUtils.adjustHSV( stoneMaterial.color, 0, 0, 0.9 );

    //clear out environment objects to make room for the site
    //for (var i = 0; i < zones[zoneIndex].envObjects.length; i++) {
        //zones[zoneIndex].envObjects.splice(i, 1);
        //zones[zoneIndex].envObjectMeshes.splice(i, 1);
    //}

    // generate uprights
    var halfExtents = new CANNON.Vec3(.5,columnLength,.5);
    var stoneShape = new CANNON.Box(halfExtents);
    var stoneGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    var x = originX+columnOffset;
    var y = columnLength;
    var z = originZ+columnLength;
    var stoneBody = new CANNON.RigidBody(mass,stoneShape);
    var stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    x = originX+columnOffset;
    y = columnLength;
    z = originZ-columnLength;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    x = originX-columnOffset;
    y = columnLength;
    z = originZ+columnLength;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    x = originX-columnOffset;
    y = columnLength;
    z = originZ-columnLength;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});
    //zones[zoneIndex].envObjectMeshes.push(stoneMesh);

    x = originX+columnLength;
    y = columnLength;
    z = originZ-columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});
    //zones[zoneIndex].envObjectMeshes.push(stoneMesh);

    x = originX-columnLength;
    y = columnLength;
    z = originZ-columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});
    //zones[zoneIndex].envObjectMeshes.push(stoneMesh);

    x = originX+columnLength;
    y = columnLength;
    z = originZ+columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});
    //zones[zoneIndex].envObjectMeshes.push(stoneMesh);

    x = originX-columnLength;
    y = columnLength;
    z = originZ+columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});


    //generate tops
    halfExtents = new CANNON.Vec3(.5,.5,3);
    stoneShape = new CANNON.Box(halfExtents);
    stoneGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    x = originX+columnOffset;
    y = columnOffset;
    z = originZ;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    x = originX-columnOffset;
    y = columnOffset;
    z = originZ;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    halfExtents = new CANNON.Vec3(3,.5,.5);
    stoneShape = new CANNON.Box(halfExtents);
    stoneGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    x = originX;
    y = columnOffset;
    z = originZ+columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    x = originX;
    y = columnOffset;
    z = originZ-columnOffset;
    stoneBody = new CANNON.RigidBody(mass,stoneShape);
    stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    // generate center
    var halfExtents = new CANNON.Vec3(.5,.5,.5);
    var stoneShape = new CANNON.Box(halfExtents);
    var stoneGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    var x = originX;
    var y = .5;
    var z = originZ;
    var stoneBody = new CANNON.RigidBody(mass,stoneShape);
    var stoneMesh = new THREE.Mesh( stoneGeometry, stoneMaterial );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"stone"});

    //generate book
    var bookMat = new THREE.MeshBasicMaterial({color: 0x5CB3FF});

    var halfExtents = new CANNON.Vec3(.3,.1,.4);
    var stoneShape = new CANNON.Box(halfExtents);
    var stoneGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    var x = originX;
    var y = .6;
    var z = originZ;
    var stoneBody = new CANNON.RigidBody(mass/10,stoneShape);
    var stoneMesh = new THREE.Mesh( stoneGeometry, bookMat );
    world.add(stoneBody);
    scene.add(stoneMesh);
    stoneBody.position.set(x,y,z);
    stoneMesh.position.set(x,y,z);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    zones[zoneIndex].envObjects.push({"body":stoneBody,"mesh":stoneMesh, "type":"item", "interactText":"Press E to Interact", "interact":spellIntro});

}

function checkChangeZone() {
    var playerX = Math.round(player.body.position.x/ZONE_SIZE);
    var playerZ = Math.round(player.body.position.z/ZONE_SIZE);
    if (currentZoneX != playerX || currentZoneZ != playerZ) {
        changeZone(playerX, playerZ); //so it generates asynchronously
        console.log("Changning Zone: " + playerX + ", " + currentZoneX, " | " + playerZ + ", " + currentZoneZ);

    }
}

function changeZone(newZoneX, newZoneZ) {
    var deltaX = currentZoneX - newZoneX; 
    var deltaZ = currentZoneZ - newZoneZ;
    if (Math.abs(deltaX) + Math.abs(deltaZ) != 1 || zones.length == 0) {
        //generate all new zones
        generateZone(newZoneX-1, newZoneZ-1, 0);
        generateZone(newZoneX, newZoneZ-1, 1);
        generateZone(newZoneX+1, newZoneZ-1, 2);
        generateZone(newZoneX-1, newZoneZ, 3);
        generateZone(newZoneX, newZoneZ, 4);
        generateZone(newZoneX+1, newZoneZ, 5);
        generateZone(newZoneX-1, newZoneZ+1, 6);
        generateZone(newZoneX, newZoneZ+1, 7);
        generateZone(newZoneX+1, newZoneZ+1, 8);
    } else {
        if (deltaX == -1) {
            removeZone(0);
            removeZone(3);
            removeZone(6);
            zones[0] = zones[1];
            zones[1] = zones[2];
            zones[3] = zones[4];
            zones[4] = zones[5];
            zones[6] = zones[7];
            zones[7] = zones[8];
            generateZone(newZoneX+1, newZoneZ-1, 2);
            generateZone(newZoneX+1, newZoneZ, 5);
            generateZone(newZoneX+1, newZoneZ+1, 8);
        } else if (deltaX == 1) {
            removeZone(2);
            removeZone(5);
            removeZone(8);
            zones[2] = zones[1];
            zones[1] = zones[0];
            zones[5] = zones[4];
            zones[4] = zones[3];
            zones[8] = zones[7];
            zones[7] = zones[6];
            generateZone(newZoneX-1, newZoneZ-1, 0);
            generateZone(newZoneX-1, newZoneZ, 3);
            generateZone(newZoneX-1, newZoneZ+1, 6);
        } else if (deltaZ == -1) {
            removeZone(0);
            removeZone(1);
            removeZone(2);
            zones[0] = zones[3];
            zones[3] = zones[6];
            zones[1] = zones[4];
            zones[4] = zones[7];
            zones[2] = zones[5];
            zones[5] = zones[8];
            generateZone(newZoneX-1, newZoneZ+1, 6);
            generateZone(newZoneX, newZoneZ+1, 7);
            generateZone(newZoneX+1, newZoneZ+1, 8);
        } else if (deltaZ == 1) {
            removeZone(6);
            removeZone(7);
            removeZone(8);
            zones[6] = zones[3];
            zones[3] = zones[0];
            zones[7] = zones[4];
            zones[4] = zones[1];
            zones[8] = zones[5];
            zones[5] = zones[2];
            generateZone(newZoneX-1, newZoneZ-1, 0);
            generateZone(newZoneX, newZoneZ-1, 1);
            generateZone(newZoneX+1, newZoneZ-1, 2);
        }
    }
    currentZoneX = newZoneX;
    currentZoneZ = newZoneZ;
    
}

function removeZone(zoneIndex) {
    //remove objects from scene
    for(var i=0; i<zones[zoneIndex].envObjects.length; i++){
        world.remove(zones[zoneIndex].envObjects[i].body);
        scene.remove(zones[zoneIndex].envObjects[i].mesh);
        if (zones[zoneIndex].envObjects[i].type == "tree") {
            trees.push(zones[zoneIndex].envObjects[i]);
            //TODO reset rotation vector and velocity vector
        } else {
            delete zones[zoneIndex].envObjects[i];
        }
    }
    scene.remove(zones[zoneIndex].floor);

    delete zones[zoneIndex];
}

function generateZone(newZoneX, newZoneZ, zoneIndex) {
    // floor
    zones[zoneIndex] = {envObjects:[]};
    //var floorMaterial = new THREE.MeshLambertMaterial( { color: 0x347C2C } );
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x347C2C});
    geometry = new THREE.PlaneGeometry( ZONE_SIZE, ZONE_SIZE);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    mesh = new THREE.Mesh( geometry, floorMaterial );
    mesh.position.set(newZoneX*ZONE_SIZE,0,newZoneZ*ZONE_SIZE);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    zones[zoneIndex].floor = mesh;
    scene.add( mesh );

    //KRM custom generate
    addTrees(newZoneX*ZONE_SIZE, newZoneZ*ZONE_SIZE, zoneIndex);
    if (newZoneX == 0 && newZoneZ == 1) {
        generateRelicSite(newZoneX*ZONE_SIZE,newZoneZ*ZONE_SIZE, zoneIndex);
    }
    //for(var i=0; i<pois.length; i++){
    //    if (pois[i].x == newZoneX && pois[i].z == newZoneZ) {
            //pois[i].action(newZoneX, newZoneZ, zoneIndex);
            //introSpell(newZoneX, newZoneZ, zoneIndex);
            //generateRelicSite(newZoneX*ZONE_SIZE,newZoneZ*ZONE_SIZE, zoneIndex);

    //    }
    //}
}
        