var ON_ISLAND = "You find yourself on an island";
var OFF_ISLAND = "You must find your way off";
var MOVE = "W,A,S,D = Move, SPACE = Jump, MOUSE = Look";
var INTUITION = "Follow your intuition";
var ISLAND = "The island has many magical and mysterious qualities"
var ARTIFACTS = "The island contains many magical artifacts";
var KNOW = "Though you cannot know what each will do";
var CAST = "Click = Cast Spell";
var SEARCH = "Perhaps you should search for more artifacts";
var GIFTS = "It is willing to grant you gifts"
var CURSE = "But for every gift, you must choose a curse"
var CHOOSE = "Choose wisely..."

var TEXT_TIME = 2500;
var currentSelection = 0;

var SKIP_INTRO = true;

function gameSetup() {
	player.destination = new THREE.Vector3(0*ZONE_SIZE, 0, 1*ZONE_SIZE); //TODO maybe build quest system?

	if (SKIP_INTRO) {
		instructions.removeEventListener( 'click', gameSetup, false );
		beginWorld();
		$("#blocker").fadeOut(TEXT_TIME);
		$("#instructions").hide();
	    controls.enabled = true;
	    $('#nav').fadeIn(0);
	} else {
		instructions.removeEventListener( 'click', gameSetup, false );
		beginWorld();
		$("#instructions").hide();
		window.setTimeout(function(){fadeText(ON_ISLAND)},TEXT_TIME*0);
	    window.setTimeout(function(){fadeText(OFF_ISLAND)},TEXT_TIME*2);
	    /*window.setTimeout(function(){fadeText(ISLAND)},TEXT_TIME*4);
	    window.setTimeout(function(){fadeText(GIFTS)},TEXT_TIME*6);
	    window.setTimeout(function(){fadeText(CURSE)},TEXT_TIME*8);
	    window.setTimeout(function(){fadeText(CHOOSE)},TEXT_TIME*10);
	    window.setTimeout(function(){selectHouse()},TEXT_TIME*12);*/
	    
	    //selectHouse();
	    window.setTimeout(function(){
	    	$("#blocker").fadeOut(TEXT_TIME);
	    	controls.enabled = true;
	    	fadeText(MOVE)
	    },TEXT_TIME*4);
	    window.setTimeout(function(){fadeText(INTUITION);},TEXT_TIME*6);
	    window.setTimeout(function(){$('#nav').fadeIn(TEXT_TIME);},TEXT_TIME*7);
	}

}

function fadeText(text) {
	instructions.innerHTML = '<span style="font-size:40px">' + text + "</span>";
	$('#instructions').fadeIn(TEXT_TIME, function(){$('#instructions').fadeOut(TEXT_TIME, function(){});});
}

function selectHouse() {
	displayHouse();
}

function displayHouse(){
	$('#instructions').fadeIn(TEXT_TIME,function(){});
	instructions.innerHTML = '<span style="font-size:40px; color: #3bb9ff">Haven: ' + houses[currentSelection].title + "</span><br>";
	instructions.innerHTML += '<span style="width:50%">' + houses[currentSelection].description + "</span><br>";
	instructions.innerHTML += '<span id="left" style="font-size:40px;padding-right: 200px">&#171;</span>';
	instructions.innerHTML += '<span id="select" style="font-size:20px">Select</span>';
	instructions.innerHTML += '<span id="right" style="font-size:40px; padding-left: 200px">&#187;</span><br>';
	$( "#left" ).click(function() {
	  currentSelection--;
	  if (currentSelection < 0) {
	  	currentSelection = houses.length - 1;
	  }
	  $('#instructions').hide()
	  displayHouse();
	});
	$( "#right" ).click(function() {
	  currentSelection++;
	  if (currentSelection > houses.length - 1) {
	  	currentSelection = 0;
	  }
	  $('#instructions').hide()
	  displayHouse();
	});

	$( "#select" ).mouseover(function() {
	  $( "#select" ).css("color", "#ccc");
	});

	$( "#select" ).mouseout(function() {
	  $( "#select" ).css("color", "#fff");
	});

	$( "#select" ).click(function() {
		$("#instructions").hide();
		fadeText(houses[currentSelection].select);
	 	window.setTimeout(function(){selectTrinket()},TEXT_TIME*2);

	});
}

function selectTrinket() {
	currentSelection = 0;
	displayTrinket();
}

function displayTrinket(){
	$('#instructions').fadeIn(TEXT_TIME,function(){});
	instructions.innerHTML = '<span style="font-size:40px; color: #3bb9ff">Trinket: ' + trinkets[currentSelection].title + "</span><br>";
	instructions.innerHTML += '<span style="width:50%">' + trinkets[currentSelection].description + "</span><br>";
	instructions.innerHTML += '<span id="left" style="font-size:40px;padding-right: 200px">&#171;</span>';
	instructions.innerHTML += '<span id="select" style="font-size:20px">Select</span>';
	instructions.innerHTML += '<span id="right" style="font-size:40px; padding-left: 200px">&#187;</span><br>';
	$( "#left" ).click(function() {
	  currentSelection--;
	  if (currentSelection < 0) {
	  	currentSelection = trinkets.length - 1;
	  }
	  $('#instructions').hide()
	  displayTrinket();
	});
	$( "#right" ).click(function() {
	  currentSelection++;
	  if (currentSelection > trinkets.length - 1) {
	  	currentSelection = 0;
	  }
	  $('#instructions').hide()
	  displayTrinket();
	});

	$( "#select" ).mouseover(function() {
	  $( "#select" ).css("color", "#ccc");

	});

	$( "#select" ).mouseout(function() {
	  $( "#select" ).css("color", "#fff");

	});

	$( "#select" ).click(function() {
		$("#instructions").hide();
		fadeText(trinkets[currentSelection].select);
	 	window.setTimeout(function(){selectCurse()},TEXT_TIME*2);


	});
}

function selectCurse() {
	currentSelection = 0;
	displayCurse();
}

function displayCurse(){

	$('#instructions').fadeIn(TEXT_TIME,function(){});
	instructions.innerHTML = '<span style="font-size:40px; color: #7FFFD4">Curse: ' + curses[currentSelection].title + "</span><br>";
	instructions.innerHTML += '<span style="width:50%">' + curses[currentSelection].description + "</span><br>";
	instructions.innerHTML += '<span id="left" style="font-size:40px;padding-right: 200px">&#171;</span>';
	instructions.innerHTML += '<span id="select" style="font-size:20px">Select</span>';
	instructions.innerHTML += '<span id="right" style="font-size:40px; padding-left: 200px">&#187;</span><br>';
	$( "#left" ).click(function() {
	  currentSelection--;
	  if (currentSelection < 0) {
	  	currentSelection = curses.length - 1;
	  }
	  $('#instructions').hide()
	  displayCurse();
	});
	$( "#right" ).click(function() {
	  currentSelection++;
	  if (currentSelection > curses.length - 1) {
	  	currentSelection = 0;
	  }
	  $('#instructions').hide()
	  displayCurse();
	});

	$( "#select" ).mouseover(function() {
	  $( "#select" ).css("color", "#ccc");

	});

	$( "#select" ).mouseout(function() {
	  $( "#select" ).css("color", "#fff");

	});

	$( "#select" ).click(function() {
		$("#instructions").hide();
			fadeText(curses[currentSelection].select);
			window.setTimeout(function(){
	        $("#blocker").fadeOut(TEXT_TIME);
	        beginWorld();
	        controls.enabled = true;
        },TEXT_TIME*2);

	});
}

function spellIntro() {
	window.setTimeout(function(){fadeText(ARTIFACTS)},TEXT_TIME*0);
	window.setTimeout(function(){fadeText(KNOW)},TEXT_TIME*2);
	window.setTimeout(function(){fadeText(CAST)},TEXT_TIME*4);
	window.setTimeout(function(){fadeText(SEARCH)},TEXT_TIME*6);

}