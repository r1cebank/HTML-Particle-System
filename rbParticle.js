//Debug

var stop = 0

//Canvas

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

//Particles
var particles = [];

//Particle Param

var emitterConfig = {
	totalParticles: 200
};
var emitterPosition = {
	x: canvas.width / 2,
	y: canvas.height / 2
};
var particlesParam = {
	life: 20,
	angle: 10,
	speed: 20,
	size: 12
};

var startColor = {
	r: 73,
	g: 196,
	b: 190
};

function Particle(x, y, life, angle, speed, size, color) {
	this.position = {
		x: x,
		y: y
	};
	
	var angleInRadians = angle * Math.PI / 180;
	this.velocity = {
		x: speed * Math.cos(angleInRadians),
		y: -speed * Math.sin(angleInRadians)
	};
	this.originalLife = this.life = life;
	this.color = color;
	this.originalSize = this.size = size;
	this.alpha = 1;
	/*this.r = color.r;
	this.g = color.g;
	this.b = color.b;*/
	this.r = Math.round(Math.random() * 255);
	this.g = Math.round(Math.random() * 255);
	this.b = Math.round(Math.random() * 255);
}

Particle.prototype.update = function(dt) {
	this.life -= dt;
	
	if(this.life > 0) {
		var ageRatio = this.life / this.originalLife;
		this.size = this.originalSize * ageRatio;
		this.alpha = ageRatio;
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;
		}
};

///////////////Finish Particle Engine Code////////////////

//////////////Emitter Engine Code/////////////////

function Emitter(config) {
	apply(this, config);
	
	this.particlePool = [];
	
	for(var i = 0; i< emitterConfig.totalParticles; i++) {
		this.particlePool.push(new Particle());
	}
	
}

function loop() {
	clear();
	if(stop) {
		stop = 0;
		return;
	}
	addParticle();
	draw();
	queue();
}

function queue() {
	window.requestAnimationFrame(loop);
}

function addParticle() {
	particles.push(new Particle(emitterPosition.x, emitterPosition.y, particlesParam.life, Math.random() * 360 - 1, Math.random() * (20-8) + 8, particlesParam.size, startColor));
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
	for(var i = 0; i < particles.length; i++) {
		particles[i].update(0.1);
		var part = particles[i];
		var position = particles[i].position;
		if(particles[i].life <= 0) continue;
		
		ctx.fillStyle = 'rgba('+ part.r + ',' + part.g + ',' + part.b +','+ part.alpha +')';
		ctx.beginPath();
		ctx.arc(position.x, position.y, part.size, 0, Math.PI*2, true);
		ctx.fill();
	}
}

function debug (param) {
	switch(param) {
		case 'stop':
			stop = 1;
			break;
	}
}

loop();