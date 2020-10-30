// video variables
let video;
let showCapture = true;

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
}

// CALLED EVERY FRAME
function draw() {
	// clear background
	background(255);

	// translate and scale canvas to draw the following like a mirror
	push();
	translate(width, 0);
	scale(-1, 1);
	if (showCapture) {
		drawCapture(); // AUX FUNCTION 
	}
	pop();
}
