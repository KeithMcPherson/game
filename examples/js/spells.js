var ARCANE_MAT = new THREE.MeshBasicMaterial({color: 0x5CB3FF});
var DARK_MAT = new THREE.MeshBasicMaterial({color: 0x461B7E});
var FIRE_MAT = new THREE.MeshBasicMaterial({color: 0xE42217});
var ELEMENTAL_MAT = new THREE.MeshBasicMaterial({color: 0x4CC417});

var ARCANE = 1;
var DARK = 2;
var FIRE = 3;
var ELEMENTAL = 4;

var SINGLE = 1;
var MULTI = 2;
var STREAM = 3;
var WAVE = 4;


function generateSpell() {
	var spell = {};
	spell.mass = Math.random()*50+10;
	// todo spell.projectileType = Math.floor((Math.random()*4)+1);
	spell.projectileType = SINGLE;
	spell.damageType = Math.floor((Math.random()*4)+1);
	spell.damage = Math.random()*10;
	spell.velocity = Math.random()*40+10;
	spell.cost = 5; //todo
	return spell;
}

function getSpellMaterial(damageType) {
	if (damageType == ARCANE)
		return ARCANE_MAT;
	else if (damageType == DARK)
		return DARK_MAT;
	else if (damageType == FIRE)
		return FIRE_MAT;
	else if (damageType == ELEMENTAL)
		return ELEMENTAL_MAT;
}	