// video variables
let video;
let showCapture = true;

// ml5 global variables
let classifier;
let detections;


// classifier options
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false
};

// trigger boundary and threshold variables
let middleX;
let mouthOpenThreshold = 10;
let lastMouthOpenBool = false;


// sound related variables
let osc, playing, freq, amp;

let sound1, sound2;


function drawMouths() {
	if (detections) {
		stroke("white");
		strokeWeight(4);
		noFill();

		for (let formIdx = 0; formIdx < detections.length; formIdx++) {
			let mouthArr = detections[formIdx].parts.mouth;
			beginShape();
			for (let mouthIdx = 0; mouthIdx < mouthArr.length; mouthIdx++) {
				vertex(mouthArr[mouthIdx]._x, mouthArr[mouthIdx]._y);
			}
			vertex(mouthArr[0]._x, mouthArr[0]._y);
			endShape();
		}
	}
}


function isMouthOpen(mouthTopPos, mouthBtmPos) {
	return (
		dist(mouthTopPos._x, mouthTopPos._y, mouthBtmPos._x, mouthBtmPos._y) >
		mouthOpenThreshold
	);
}

function playOscillator() {
	// starting an oscillator on a user gesture will enable audio
	// in browsers that have a strict autoplay policy.
	// See also: userStartAudio();
	osc.start();
	playing = true;
}

function fadeOutOscillator() {
	// ramp amplitude to 0 over 0.5 seconds
	osc.amp(0, 0.5);
	playing = false;
}


function triggerSoundBasedOnPos(targetPos) {

  freq = constrain(map(mouseX, 0, width, 100, 500), 100, 500);
	amp = constrain(map(mouseY, height, 0, 0, 1), 0, 1);


	if (playing) {
		// smooth the transitions by 0.1 seconds
		osc.freq(freq, 0.1);
		osc.amp(amp, 0.1);
	}

}


// ML5 CALLBACK FUNCTIONS

function modelLoaded() {
    console.log("Model loaded!");

    // run face detection, with gotResult method passed as callback
    classifier.detect(gotResult);

    /* enable the next line to hide webcam view
       after model has loaded */
    // showCapture = false;
}


function gotResult(error, results) {
	// display error in the console
	if (error) {
		console.error(error);
	} else {
		// do something with your results
		// console.log("new results: "); // uncomment for debugging
		// console.log(results); // uncomment for debugging
		// bind to a global `detections` variable
		detections = results;
	}

	// call the detect method again here so it keeps going
	// could also potentially call detect in draw, with some handling
	classifier.detect(gotResult);
}


// DRAW AUXILIAR FUNCTION

function drawCapture() {
	tint(255, 128);
	image(video, 0, 0, width, height);

	/* enable the next line to hide webcam view
       after model has loaded */
	// showCapture = false;
}

// P5.js DEFAULT FUNCTIONS

// CALLED ONCE BEFORE SETUP
function preload() {}

// CALLED AT PROGRAM START
function setup() {
	// set up a p5 canvas
	createCanvas(600, 400);

	// load video using p5
	video = createCapture(VIDEO);
	// set video size to width and height of canvas
	// hide video feed to render later in draw
	video.size(width, height);
	video.hide();

	// load classifier with video, options, and callback
	classifier = ml5.faceApi(video, detectionOptions, modelLoaded);

  osc = new p5.Oscillator("sine");
}

// CALLED EVERY FRAME
function draw() {
	// clear background
	background(255);

	// uses last logged detections
	if (detections) {
		// drawNumberedLandmarks(); // uncomment for debugging

		// if mouth open, trigger sound based on pos
		for (let formIdx = 0; formIdx < detections.length; formIdx++) {
			let mouthTop = detections[formIdx].landmarks._positions[62];
			let mouthBtm = detections[formIdx].landmarks._positions[66];
			console.log(isMouthOpen(mouthTop, mouthBtm)); // uncomment for debugging
			if (!lastMouthOpenBool && isMouthOpen(mouthTop, mouthBtm)) {
				// triggerSoundBasedOnPos(mouthTop);
				playOscillator();

				freq = constrain(map(mouthTop._y, 0, width, 500, 100), 100, 500);
				amp = constrain(map(mouthTop._x, height, 0, 0, 1), 0, 1);
			} else if (lastMouthOpenBool && !isMouthOpen(mouthTop, mouthBtm))
				fadeOutOscillator();
		
			lastMouthOpenBool = isMouthOpen(mouthTop, mouthBtm);

      osc.freq(freq, 0.1);
  		osc.amp(amp, 0.1);

		}
	}

	// translate and scale canvas to draw the following like a mirror
	push();
	translate(width, 0);
	scale(-1, 1);
	if (showCapture) {
		drawCapture(); // AUX FUNCTION
	}
  drawMouths();
	pop();
}



// DEBUG FUNCTIONS


function drawNumberedLandmarks() {
	if (detections) {
		textSize(12);
		fill(100);
		for (let formIdx = 0; formIdx < detections.length; formIdx++) {
			let landmarks = detections[formIdx].landmarks._positions;
			for (let landmarkIdx = 0; landmarkIdx < landmarks.length; landmarkIdx++) {
				text(
					landmarkIdx,
					width - landmarks[landmarkIdx]._x,
					landmarks[landmarkIdx]._y
				);
			}
		}
	}
}