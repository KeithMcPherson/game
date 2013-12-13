var player = {
	health:100,
	stamina:100,
	leftSpell:generateSpell(),
};

playerInit();

//TODO new ui causes impossible to resume game after pause
function drawUI() {
	$("#health").css("width",player.health+"px");
	$("#stamina").css("width",player.stamina+"px");
    
    //KRM setup crosshair
    $("#crosshair").css("left",(window.innerWidth-25)/2+"px");
    $("#crosshair").css("top",(window.innerHeight-25)/2+"px");

    //set nav rotation
    if (player.hasOwnProperty('destination')) {
        var angle = Math.atan2(player.destination.z - player.body.position.z, player.destination.x - player.body.position.x) * 180 / Math.PI;
        angle +=90;
        var rotAngle = (controls.getObject().rotation.y) * 180 / Math.PI;
        angle += rotAngle;
        angle = angle % 360;
        $("#nav").css("transform", "rotate(" + angle + "deg)");
        $("#nav").css("-ms-transform", "rotate(" + angle + "deg)");
        $("#nav").css("-webkit-transform", "rotate(" + angle + "deg)");
    }
}

function playerInit() {
	// Create a slippery material (friction coefficient = 0.0)
    var physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.1, // friction coefficient
                                                            0.3  // restitution
                                                            );

	// Create a sphere
    var mass = 5, radius = 1.3;
    sphereShape = new CANNON.Sphere(radius);
    player.body = new CANNON.RigidBody(mass,sphereShape,physicsMaterial);
    player.body.position.set(0,5,0);
    player.body.linearDamping = 0.9;
}