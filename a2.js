
var CURRENT_SIZE = 50;
var MAX_SIZE = 200;
var MIN_SIZE = 20;
var CURRENT_STEP_TIME = 300;
var MAX_STEP_TIME = 1000;
var MIN_STEP_TIME = 0;
var currentState = [];
var currentlyRunning = true; //boolean indicating whether animation is running
var intervalId;
var currentBorderBehavior = "toroidal";
var currentR = 1;
var currentL = 2;
var currentO = 3
var currentGmin = 3;
var currentGmax = 3;

$(document).ready(function() {
   initClicks();
   initInputs();
   buildGrid(CURRENT_SIZE);

   randomlyFillGrid();
   startAnimation();
});

function startAnimation() {
		intervalId = setInterval(step, CURRENT_STEP_TIME);
}

function clearGrid() {
	currentState = [];
	buildGrid(CURRENT_SIZE);
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

	$('#r-input').val(currentR);
	$('#l-input').val(currentL);
	$('#o-input').val(currentO);
	$('#gmin-input').val(currentGmin);
	$('#gmax-input').val(currentGmax);

	$('#r-input').on('change', function() {
		var input = parseInt($(this).val());
		var newValue;

		if (isNaN(input)) {
			$(this).val(currentR);
			return;
		}
		else if (input < 1) {
			newValue = 1;
		}
		else if (input > 10) {
			newValue = 10;
		}
		else {
			newValue = input;
		}
		$(this).val(newValue);
	    currentR = newValue;
	});

	$('#l-input').on('change', function() {
		var input = parseInt($(this).val());
		var newValue;

		if (isNaN(input)) {
			$(this).val(currentL);
			return;
		}
		else if (input < 1) {
			newValue = 1;
		}
		else if (input > currentO) {
			newValue = currentO;
		}
		else {
			newValue = input;
		}
		$(this).val(newValue);
		currentL = newValue;
	});

	$('#o-input').on('change', function() {
		var input = parseInt($(this).val());
		var newValue;

		if (isNaN(input)) {
			$(this).val(currentO);
			return;
		}
		else if (input < currentL) {
			newValue = currentL;
		}
		else if (input >= (4*currentR*currentR + 4*currentR)) {
			newValue = (4*currentR*currentR + 4*currentR) - 1;
		}
		else {
			newValue = input;
		}

		$(this).val(newValue);
		currentO = newValue;
	});

	$('#gmin-input').on('change', function() {
		var input = parseInt($(this).val());
		var newValue;

		if (isNaN(input)) {
			$(this).val(currentGmin);
			return;
		}
		else if (input < 1) {
			newValue = 1;
		}
		else if (input > currentGmax) {
			newValue = currentGmax;
		}
		else {
			newValue = input;
		}

		$(this).val(newValue);
		currentGmin = newValue;
	});

	$('#gmax-input').on('change', function() {
		var input = parseInt($(this).val());
		var newValue;

		if (isNaN(input)) {
			$(this).val(currentGmax);
			return;
		}
		else if (input < currentGmin) {
			newValue = currentGmin;
		}
		else if (input >= (4*currentR*currentR + 4*currentR)) {
			newValue = (4*currentR*currentR + 4*currentR) - 1;
		}
		else {
			newValue = input;
		}

		$(this).val(newValue);
		currentGmax = newValue;
	});

	$('#size-input').val(CURRENT_SIZE);

	$('#size-input').on('change', function() {
		var newSize = parseInt($(this).val());

		if (isNaN(newSize)) {
			$(this).val(CURRENT_SIZE);
			return;
		}
		else if (newSize < MIN_SIZE) {
			newSize = MIN_SIZE;
		}
		else if (newSize > MAX_SIZE) {
			newSize = MAX_SIZE;
		}

		$(this).val(newSize);
		CURRENT_SIZE = newSize;
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
		for (var i = 0; i < CURRENT_SIZE; i++) {

			var thisRow = [];
			for (var j = 0; j < CURRENT_SIZE; j++) {
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
		if (numSurrounding < currentL) {
			return 0;
		}
		else if (numSurrounding > currentO) {
			return 0;
		}
		else {
			return 1;
		}
	}
	else {
		if (numSurrounding >= currentGmin && numSurrounding <= currentGmax) {
			return 1;
		}
		else {
			return 0;
		}
	}
}

function getNumAliveSurroundingSquare(x, y) {
	var numAlive = 0;
	var xMinBound = x-currentR;
	var xMaxBound = x+currentR;
	var yMinBound = y-currentR;
	var yMaxBound = y+currentR;

	for (var i = yMinBound; i <= yMaxBound; i++) {
		for (var j = xMinBound; j <= xMaxBound; j++) {
			//alert(i + ', ' + j + 'and current boundaries are ' + yMinBound+', '+yMaxBound+':'+xMinBound+', '+ xMaxBound);
			if (i == y && j == x) {
				continue;
			}
			if (currentBorderBehavior == "toroidal") {
				if (currentState[i.mod(CURRENT_SIZE)] && currentState[i.mod(CURRENT_SIZE)][j.mod(CURRENT_SIZE)]) {
					numAlive++;
				}
			}
			else {
				if (currentState[i] && typeof currentState[i][j] !== 'undefined') {
					if (currentState[i][j]) {
						numAlive++;
					}
				}
				else {
					if (currentBorderBehavior == "alive") {
						numAlive++;
					}
				}
			}

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
	for(var i = 0; i < CURRENT_SIZE; i++) {
    	for(var z = 0; z < CURRENT_SIZE; z++) {
      		str += currentState[i][z];
   		}
   		str+= "\n";
  	}
	alert(str);
}

function generateRandomBoolean() {
	return Math.random() >= 0.7;
}


function buildGrid(size) {

	var html = '<table id="main-grid" cellspacing= "1px">';
    var i;

    //instantiate currentState grid
    for (i = 0; i < size; i++) {
    	var j;
    	var thisRow = [];
    	for (j = 0; j < size; j++) {
    		thisRow.push(0);
    	}
    	currentState.push(thisRow);
    }


	for (i = 0; i < size; i++) {
		html += '<tr>';
		var j;
		for (j = 0; j < size; j++) {
  			html += '<td class="square dead" id="'+i+'-'+j+'"></td>';
		}
		html += '</tr>';
	}
	html += '</table>';

	$('#table-div').html(html);
}