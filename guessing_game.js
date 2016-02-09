// Make sure script only loads once document loads and also avoids global variables
$(document).ready(function() {
	var MAX_GUESSES = 5; // Max guesses
	var guesses = []; // To keep track of player's guesses
	// Function to generate random number
	var generateRandomNumber = function () {
		return Math.floor(Math.random()*100);
	};
	// Generate winning number
	var winningNumber = generateRandomNumber(); 
	// Initialise guesses remaining number
	$("#guesses-remaining").text(MAX_GUESSES);

	/* Event Listeners/Handlers */

	// If the user clicks on the submit button, get the user's guess, check it and process it
	$("#submit").on("click", function(event) {
		var playersGuess = playersGuessSubmission();
		var guessStatus = checkGuess(playersGuess);
		guessMessage(guessStatus);

		// If guess is valid and not a duplicate, then process the guess
		if (guessStatus === "correct" || guessStatus === "final" || guessStatus === "incorrect") {
			processGuess(guessStatus);
		};

		// Function to fetch player's guess and clear the input box
		function playersGuessSubmission() {
			var playersGuess = parseInt($("#guess").val());
			$("#guess").val("");
			return playersGuess;
		};

		// Function to check the player's guess is either 1) valid; 2) a duplicate; 3) correct; 4) incorrect and the last guess; or 5) incorrect but not the last guess
		function checkGuess(playersGuess){
			// Check if player's guess is not valid, i.e. if it is not a number or beyond the 0-100 range
			if (isNaN(playersGuess) || typeof playersGuess !== "number" || playersGuess < 0 || playersGuess > 100) {
				return "invalid";
			}; 

			// Check that guess is not a duplicate
			for (var i = 0; i < guesses.length; i++) {
				if (playersGuess ===  guesses[i]) {
					return "duplicate";
				};
			};

			// Check whether player's guess is correct
			if (playersGuess === winningNumber) {
				return "correct";
			};

			// Check if incorrect final guess
			if (guesses.length === MAX_GUESSES - 1) {
				return "final";
			};

			// Otherwise, it is an incorrect guess but not final
			return "incorrect";
		};

		// Function to update feedback for player's guess based on the guess status
		function guessMessage(guessStatus) {
			// Insert a feedback div and remove any existing feedback div
			$(".feedback").remove();
			$(".user-guesses").before("<div class='feedback container'></div>");

			// Update feedback message
			switch(guessStatus) {
				case "invalid":
					$(".feedback").text("Invalid guess - please try again");
					break;
				case "duplicate":
					$(".feedback").text("You've already guessed that number");
					break;
				case "correct":
					$(".feedback").text("Correct");
					$(".feedback").css("color", "#060");
					$(".feedback").append("<div class='glyphicon glyphend glyphicon-ok'></div>");
					break;
				case "final":
					$(".feedback").text("You have lost");
					$(".feedback").css("color", "#600");
					$(".feedback").append("<div class='glyphicon glyphend glyphicon-remove'></div>");
					debugger;
					break;
				case "incorrect":
					var lowOrHigh = lowerOrHigher();
					var diffCategory = differenceCategory();
					$(".feedback").text("Incorrect - your guess is " + lowOrHigh + " and " + diffCategory + " the correct number");
					$(".feedback").css("color", "#600");
					break;
				default:
					$(".feedback").text("Something went wrong - please try again");
			};

			// Determine if the next guess should be a lower or higher number
			function lowerOrHigher(){
				if (playersGuess - winningNumber > 0) {
					return "higher";
				} else {
					return "lower";
				};
			};

			// Determine difference category between guess and correct answer
			function differenceCategory() {
				var difference = Math.abs(playersGuess - winningNumber);
				if (difference < 5) {
					return "within 5 of";
				} else if (difference < 10) {
					return "within 10 of";
				} else {
					return "more than 10 from"
				};
			};
		};

		// Process guess (i.e. update guess history) based on its status
		function processGuess(guessStatus) {
			function winOrLoseProcess() {
				// Remove submit button
				$("#submit").remove();
				// Remove hint button
				$("#hint").remove();
				// Remove form label and input
				$(".form-group").remove();
				// Remove guesses remaining message
				$("#guesses-message").remove();
				// Remove any hints
				$(".hint").remove();
			};

			guesses.push(playersGuess);
			$("#guess"+guesses.length).text(guesses[guesses.length - 1]);

			switch(guessStatus) {
				case "correct":
					$("#guess"+guesses.length).css("background-color", "#060");
					winOrLoseProcess();
					$(".glyphend").addClass("glyphend1");
					break;
				case "final":
					$("#guess"+guesses.length).css("background-color", "#600");
					winOrLoseProcess();
					$(".glyphend").addClass("glyphend1");
					break;
				case "incorrect":
					$("#guess"+guesses.length).css("background-color", "#600");
					var guessesLeft = MAX_GUESSES - guesses.length;
					if (guessesLeft === 1) {
						$("#guesses-message").text("You only have 1 guess remaining");
					} else {
						$("#guesses-remaining").text(guessesLeft);	
					};
					break;
			};
		};
	});

	// Do the same for if the user presses enter to submit form instead of clicking on submit button
	$("form").on("keydown", function(event) {
		if (event.which === 13) {
	        event.preventDefault();
	        $("#submit").trigger("click");
	    };
	});

	// Hint button
	$("#hint").on("click", function(event){
		var possibleAnswers = generatePossibleAnswers();
		var hintMessage = generateHintMessage(possibleAnswers);
		
		//insert hint message
		$(".user-input").after("<div class='hint'>" + hintMessage + "</div>");
		// Remove hint button
		$("#hint").remove();

		function generatePossibleAnswers() {
			// Create possible answers array starting with the correct answer
			var possibleAnswers = [winningNumber];
			// Determine number of possible answers to show based on 2x guesses left
			var possibleNumberOfAnswers = 2 * (MAX_GUESSES - guesses.length);
			
			// Generate random wrong answers and add to possible answers array
			while (possibleAnswers.length < possibleNumberOfAnswers) {
				var randomNumber = generateRandomNumber();
				var repeated = false;
				// Ensure no replication in possible answers
				for (var i = 0; i < possibleAnswers.length; i++) {
					if (randomNumber === possibleAnswers[i]) {
						repeated = true;
					};
				};
				//Ensure no replication in guesses already made by player
				for (var i = 0; i < guesses.length; i++) {
					if (randomNumber === guesses[i]) {
						repeated = true;
					};
				};

				// If no replication then add random number to possible answers
				if (repeated === false) {
					possibleAnswers.push(randomNumber);
				};
			}
			// Sort possible answers in numerical order
			possibleAnswers.sort(function(a, b) {
				return a - b;
			});

			// Return array of possible answers
			return possibleAnswers;
		};
		
		function generateHintMessage(possibleAnswers) {
			var hintMessage = "Hint: possible answers are " + possibleAnswers.slice(0, -1).join(", ") + " and " + possibleAnswers.slice(-1);
			// Return hint message
			return hintMessage;
		};

	});

	// Reset button
	$("#reset").on("click", function(event){
		location.reload();
	});

	// Focus on the guess input text box
	$("#guess").focus();

});





