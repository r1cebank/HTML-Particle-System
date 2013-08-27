//Debug

var stop = 0

//Canvas

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var stats = new Stats();
stats.setMode( 0 );
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '420px';
stats.domElement.style.top = '8px';
document.body.appendChild( stats.domElement );

canvas.width = 400;
canvas.height = 400;

/*
	Renderer
*/

var rdr = new Renderer ();
var DELTA = 0.1;
var totalParticles = 200;

//Particles
//var particles = [];

//Particle Param

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

function Emitter(/*config*/) {
	//apply(this, config);
	
	this.particlePool = [];
	
	this.particleCount = 0;
	
	for(var i = 0; i< totalParticles; i++) { ////TODO: FIX
		this.particlePool.push(new Particle());
	}
	
}

Emitter.prototype.update = function (delta) {
	while(this.shouldEmitSomeParticles()) {
		this.addParticle(); //Particle Count Updates Here
	}
	
	var particleIndex = 0;
	while(particleIndex < this.particleCount) {
		var particle = this.particlePool[particleIndex];
		this.updateParticle(delta, particle, particleIndex);
	}
};

Emitter.prototype.shouldEmitSomeParticles = function () {
	return (this.particleCount < totalParticles);
};

Emitter.prototype.getParticleFromPool = function () {
	return this.particlePool[this.particleCount];
};

Emitter.prototype.addParticle = function () {
	var particle = this.getParticleFromPool();
	this.particleCount++;
};

Emitter.prototype.returnParticleToPool = function (index) {
	var deadParticle = this.particlePool[index];
	this.particlePool[index] = this.particlePool[this.particleCount - 1];
	this.particlePool[this.particleCount - 1] = deadParticle;
};

Emitter.prototype.updateParticle = function (delta, particle, particleIndex) {
	particle.life -= delta;
		
	if(particle.life > 0) {
	
		var ageRatio = particle.life / particle.originalLife;
		particle.size = particle.originalSize * ageRatio;
		particle.alpha = ageRatio;
		particle.position.x += particle.velocity.x * dt;
		particle.position.y += particle.velocity.y * dt;
		
		//Move Particle Here and change particle properties here.
	} else {
		this.returnParticleToPool(particleIndex);
	}
};

/////////////Ended Emitter Code/////////////

////////////Start Renderer Code///////////////

function Renderer () {
	this.emitter = new Emitter();
}

/*Renderer.prototype = {
	/*update: function () {
		this.emitter.update(DELTA);
	},
	draw: function () {
		stats.begin();
		for(var i = 0; i < particles.length; i++) {
			this.emitter.particlePool[i].update(0.1);
			var part = particles[i];
			var position = particles[i].position;
			if(particles[i].life <= 0) continue;
				ctx.fillStyle = 'rgba('+ part.r + ',' + part.g + ',' + part.b +','+ part.alpha +')';
				ctx.beginPath();
				ctx.arc(position.x, position.y, part.size, 0, Math.PI*2, true);
				ctx.fill();		
		}
		stats.end();
	}
};*/

Renderer.prototype.update = function () {
	//Do something
	this.emitter.update(DELTA);
};

Renderer.prototype.draw = function () {
	stats.begin();
	for(var i = 0; i < particles.length; i++) {
		this.emitter.particlePool[i].update(0.1);
		var part = particles[i];
		var position = particles[i].position;
		if(particles[i].life <= 0) continue;
			ctx.fillStyle = 'rgba('+ part.r + ',' + part.g + ',' + part.b +','+ part.alpha +')';
			ctx.beginPath();
			ctx.arc(position.x, position.y, part.size, 0, Math.PI*2, true);
			ctx.fill();		
	}
	stats.end();
};


////Renderer will handle emitter and call emitter functions. Renderer will draw the particles in the
////emitter's particlePool

function loop() {
	clear();
	if(stop) {
		stop = 0;
		return;
	}
	rdr.update();
	//rdr.draw();
	//addParticle();
	//draw();
	queue();
}

function queue() {
	window.requestAnimationFrame(loop);
}


function debug (param) {
	switch(param) {
		case 'stop':
			stop = 1;
			break;
	}
}

loop();