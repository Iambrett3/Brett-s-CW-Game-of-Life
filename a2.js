
var CURRENT_WIDTH = 20;
var CURRENT_HEIGHT = 20;
var CURRENT_STEP_TIME = 300;
var MAX_STEP_TIME = 1000;
var MIN_STEP_TIME = 0;
var currentState = [];
var currentlyRunning = true; //boolean indicating whether animation is running
var intervalId;
var currentBorderBehavior = "toroidal";

$(document).ready(function() {
   initClicks();
   initInputs();
   buildGrid(CURRENT_WIDTH, CURRENT_HEIGHT);

   randomlyFillGrid();
   startAnimation();
});

function startAnimation() {
		intervalId = setInterval(step, CURRENT_STEP_TIME);
}

function clearGrid() {
	currentState = [];
	buildGrid(CURRENT_WIDTH, CURRENT_HEIGHT);
}

function initInputs() {
	$('#start-stop-button').on('click', function() {
		if (currentlyRunning) {
			stopAnimation();
			$(this).text('Start');
			$('#step-button').prop('disabled', false);
		}
		else {
			resumeAnimation();
			$(this).text('Stop');
			$('#step-button').prop('disabled', true);
		}
	});

	$('#border-behavior-select').on('change', function() {
		currentBorderBehavior = $(this).val();
	});

	$('#x-size-input').val(CURRENT_WIDTH);
	$('#y-size-input').val(CURRENT_HEIGHT);

	$('#x-size-input').on('change', function() {
		var newXValue = $(this).val();
		CURRENT_WIDTH = parseInt(newXValue);
		clearGrid();
	});

	$('#y-size-input').on('change', function() {
		var newYValue = $(this).val();
		CURRENT_HEIGHT = parseInt(newYValue);
		clearGrid();
	});

	$('#random-button').on('click', function() {
		var running = currentlyRunning;
		stopAnimation();
    	clearGrid();
    	randomlyFillGrid();
    	if (running) {
    		resumeAnimation();
    	}
	});

	$('#clear-button').on('click', function() {
		clearGrid();
	});

	$('#step-button').on('click', function() {
		step();
	});
	
	$('#time-slider').attr('min', MIN_STEP_TIME);
	$('#time-slider').attr('max', MAX_STEP_TIME);
	$('#time-slider').val(CURRENT_STEP_TIME);

	$('#time-slider-val').val($('#time-slider').val());

	$('#time-slider').on('change', function() {
		var newInterval = $(this).val();
		$('#time-slider-val').val(newInterval);
		CURRENT_STEP_TIME = newInterval;
		if (currentlyRunning) {
			stopAnimation();
			resumeAnimation();
		}
	});
}

function stopAnimation() {
	clearInterval(intervalId);
	currentlyRunning = false;
}

function resumeAnimation() {
	currentlyRunning = true;
	intervalId = setInterval(step, CURRENT_STEP_TIME);
}

Number.prototype.mod = function(n) {
return ((this%n)+n)%n;
};

function step() {
	var nextState = [];
		for (var i = 0; i < CURRENT_HEIGHT; i++) {

			var thisRow = [];
			for (var j = 0; j < CURRENT_WIDTH; j++) {
				var numSurrounding = getNumAliveSurroundingSquare(j, i);
				var thisSquare = $('#'+i+'-'+j);
				thisRow.push(getNextState(thisSquare, numSurrounding));
		   }
		    nextState.push(thisRow);
		}
		repaintGrid(nextState);
	    currentState = nextState;
}

function repaintGrid(state) {
	for (var i = 0; i < state.length; i++) {
		for (var j = 0; j < state[i].length; j++) {
			var square = $('#'+i+'-'+j);
			if (state[i][j]) {
				square.removeClass('dead').addClass('alive').addClass('has-been');
			}
			else {
				square.removeClass('alive').addClass('dead');
			}
		}
	}
}

function getNextState(square, numSurrounding) {
	if (square.hasClass('alive')) {
		if (numSurrounding <= 1) {
			return 0;
		}
		if (numSurrounding <= 3) {
			return 1;
		}
		if (numSurrounding >= 4) {
			return 0;
		}
	}
	else {
		if (numSurrounding == 3) {
			return 1;
		}
		else {
			return 0;
		}
	}
}

function getNumAliveSurroundingSquare(x, y) {
	var surrSquares = [];
	var numOutsideBorder; 
	var numAlive = 0;

	if (currentBorderBehavior == "toroidal") {
		surrSquares.push(currentState[(y-1).mod(CURRENT_HEIGHT)][(x-1).mod(CURRENT_WIDTH)]); //topLeft
		surrSquares.push(currentState[(y-1).mod(CURRENT_HEIGHT)][(x).mod(CURRENT_WIDTH)]); //top
		surrSquares.push(currentState[(y-1).mod(CURRENT_HEIGHT)][(x+1).mod(CURRENT_WIDTH)]); //topRight
		surrSquares.push(currentState[(y).mod(CURRENT_HEIGHT)][(x+1).mod(CURRENT_WIDTH)]); //right
		surrSquares.push(currentState[(y+1).mod(CURRENT_HEIGHT)][(x+1).mod(CURRENT_WIDTH)]); //bottomRight
		surrSquares.push(currentState[(y+1).mod(CURRENT_HEIGHT)][(x).mod(CURRENT_WIDTH)]); //bottom
		surrSquares.push(currentState[(y+1).mod(CURRENT_HEIGHT)][(x-1).mod(CURRENT_WIDTH)]); //bottomLeft
		surrSquares.push(currentState[(y).mod(CURRENT_HEIGHT)][(x-1).mod(CURRENT_WIDTH)]); //left
	

	}
	else {
		if (currentBorderBehavior == "alive") {
			//calculate the number outside the border
			if (x == 0 || x == (CURRENT_WIDTH-1)) {
				if (y == 0 || y == (CURRENT_HEIGHT-1)) {
					numOutsideBorder = 5;
				}
				else {
					numOutsideBorder = 3;
				}
			}
			else if (y == 0 || y == (CURRENT_HEIGHT-1)) {
				numOutsideBorder = 3;
			}
			else {
				numOutsideBorder = 0;
			}
				numAlive += numOutsideBorder;
		}

		//add the ones inside the border normally, checking to make sure it exists.
		if (x != 0) {
			surrSquares.push(currentState[y][x-1]); //left
			if (y != 0) {
				surrSquares.push(currentState[y-1][x-1]); //topLeft
			}
			if (y != (CURRENT_HEIGHT-1)) {
				surrSquares.push(currentState[y+1][x-1]); //bottomLeft
			}

		}
		if (x != (CURRENT_WIDTH-1)) {
			if (y != 0) {
				surrSquares.push(currentState[y-1][x+1]); //topRight
			}
			if (y != (CURRENT_HEIGHT-1)) {
				surrSquares.push(currentState[y+1][x+1]); //bottomRight
			}

			surrSquares.push(currentState[y][x+1]); //right

		}
		if (y != 0) {
			surrSquares.push(currentState[y-1][x]); //top
		}
		if (y != (CURRENT_WIDTH-1)) {
			surrSquares.push(currentState[y+1][x]); //bottom
		}		
	}

	for (var i = 0; i < surrSquares.length; i++) {
		var square = surrSquares[i];

		if (square) {
			numAlive++;
		}
	}


	return numAlive;
}


function initClicks() {
	$('#table-div').on('click', '.square', function(e) {
		var x = $(this).attr('id').split('-')[1];
		var y = $(this).attr('id').split('-')[0];
		if (e.shiftKey) {
			$(this).removeClass('dead').addClass('alive').addClass('has-been');
			currentState[y][x] = 1;
		}
		else if (e.ctrlKey) {
			$(this).removeClass('alive').addClass('dead');
			currentState[y][x] = 0;
		}
		else {
			if (currentState[y][x] == 1) {
				currentState[y][x] = 0;
			}
			else {
				currentState[y][x] = 1;
			}
			$(this).toggleClass('alive').addClass('has-been');
			$(this).toggleClass('dead');
	    }
	});
}

function randomlyFillGrid() {
	var i = 0;
	$('.square').removeClass('alive').addClass('dead');
	$('#main-grid').find('tr').each(function() {
		var j = 0;
		$(this).find('td').each(function() {
			if (generateRandomBoolean()) {
				currentState[i][j] = 1;
				$(this).removeClass('dead').addClass('alive').addClass('has-been');
			}
			j++;
		});
		i++;
	});
}

function printCurrentState() {
	var str = "";
	for(var i = 0; i < CURRENT_HEIGHT; i++) {
    	for(var z = 0; z < CURRENT_WIDTH; z++) {
      		str += currentState[i][z];
   		}
   		str+= "\n";
  	}
	alert(str);
}

function generateRandomBoolean() {
	return Math.random() >= 0.7;
}


function buildGrid(x, y) {

	var html = '<table id="main-grid">';
    var i;

    //instantiate currentState grid
    for (i = 0; i < y; i++) {
    	var j;
    	var thisRow = [];
    	for (j = 0; j < x; j++) {
    		thisRow.push(0);
    	}
    	currentState.push(thisRow);
    }


	for (i = 0; i < y; i++) {
		html += '<tr>';
		var j;
		for (j = 0; j < x; j++) {
  			html += '<td class="square dead" id="'+i+'-'+j+'"></td>';
		}
		html += '</tr>';
	}
	html += '</table>';

	$('#table-div').html(html);
}