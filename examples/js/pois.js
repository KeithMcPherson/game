var POI = function(x, z, action) {
    this.x = x;
    this.z = z;
    this.action = action;
}

var pois = [
	new POI(0, 1, introSpell)
];

function introSpell(newZoneX, newZoneZ, zoneIndex) {
	generateRelicSite(newZoneX*ZONE_SIZE,newZoneZ*ZONE_SIZE, zoneIndex);
}