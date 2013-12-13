var toLoad  = [
	"../libs/three.js",
    "../build/cannon.js",
    "js/PointerLockControls.js",
    "js/proctree.js",
    "js/spells.js",
    "js/player.js",
    "js/bird.js",
    "js/world.js",
    "js/gifts.js",
    "js/intro.js",
    "js/pois.js"

];

var total = 0;

function load() {
	total = toLoad.length;
	$('#instructions').html('<span style="font-size:40px">Loading files...</span>');
	loadScript(toLoad[0], loadMore);
}

function loadMore() {
	if (toLoad.length > 1) {
		toLoad.splice(0, 1);
    	loadScript(toLoad[0], loadMore);
	} else {
		$('#instructions').html('<span style="font-size:40px">Generating Trees...</span>');
		generateTrees();
		$('#instructions').html('<span style="font-size:40px">Click to Start</span>');

	}
}

function loadScript(url, callback)
{
	console.log("Loading: " + url);
	//$('#instructions').html('<span style="font-size:40px">' + url + "</span>");

    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);

}

load();
