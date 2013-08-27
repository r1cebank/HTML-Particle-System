var maxParticles = 200;
var emissionRate = 1;
var particleSize = 4;


var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

//Set the canvas size to the window's size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var midX = canvas.width / 2;
var midY = canvas.height / 2; 

var particles = [];

//Game Loop
function loop() {
	clear();
	update();
	draw();
	queue();
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function queue() {
	window.requestAnimationFrame(loop);
}

function update() {
	addNewParticles();
	plotParticles(canvas.width, canvas.height);
}

function draw() {
	drawParticles();
}

//Vector Function
function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.prototype.add = function(vector) {
	this.x += vector.x;
	this.y += vector.y;
};

Vector.prototype.getMagnitude = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getAngle = function() {
	return Math.atan2(this.y,this.x);
};

Vector.fromAngle = function (angle, magnitude) {
	return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

//Particle

function Particle(point, velocity, acceleration) {
	this.position = point || new Vector(0, 0);
	this.velocity = velocity || new Vector(0, 0);
	this.acceleration = acceleration || new Vector(0, 0);
}

Particle.prototype.move = function () {
	this.velocity.add(this.acceleration);
	this.position.add(this.velocity);
};

function Emitter(point, velocity, spread) {
	this.position = point;
	this.velocity = velocity;
	this.spread = spread || Math.PI / 32;
	this.drawColor = "#999";
}

Emitter.prototype.emitParticle = function () {
	var angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread *2);
	var magnitude = this.velocity.getMagnitude();
	var position = new Vector(this.position.x, this.position.y);
	var velocity = Vector.fromAngle(angle, magnitude);
	
	return new Particle(position, velocity);
};

//Particle Emission Functions
var emitters = [new Emitter(new Vector(midX - 100, midY), Vector.fromAngle(0, 2))];

function addNewParticles() {
	if(particles.length > maxParticles) return;
	
	for(var i = 0; i < emitters.length; i++) {
		for(var j = 0; j < emissionRate; j++) {
			particles.push(emitters[i].emitParticle());
		}
	}
}

function plotParticles(boundsX, boundsY) {
	var currentParticles = [];
	for(var i = 0; i < particles.length; i++) {
		var particle = particles[i];
		var pos = particle.position;
		
		if(pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;
		
		particle.move();
		
		currentParticles.push(particle);
	}
	particles = currentParticles
}

function drawParticles() {
	ctx.fillStyle = 'rgb(73,196,190)';
	
	for(var i = 0; i < particles.length; i++) {
		var position = particles[i].position;
		
		ctx.beginPath();
		ctx.arc(position.x, position.y, particleSize, 0, Math.PI*2, true);
		ctx.fill();
		//ctx.fillRect(position.x, position.y, particleSize, particleSize);
	}
}

loop();