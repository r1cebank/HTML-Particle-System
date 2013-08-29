/*
 *  rbParticle - r1cebank Particle Engine
 *  copyright 2013-2014 r1cebank
 *  simple particle engine using Javascript
 *
 */
 
 /* Test */
 
var debug = 0;
var cfg = {
	totalParticles: 100000,
	updateDelta: 0.01,
	x: 200,
	y: 200,
	configStr: "config:test"
};
 
var startColor = {
	r: 73,
	g: 196,
	b: 190
};

 /* End Test */
 
//Particle System

function rbParticle (cvName) {
	
	this.logCallsign  = "rbParticle: ";
	console.log(this.logCallsign + "engine started for canvas: " + cvName);
	
	this.canvas = document.getElementById(cvName);
	this.ctx = this.canvas.getContext('2d');
	
	this.emitter = new Emitter(cfg);
	
	
	//Stats
	this.stats = new Stats();
	this.stats.setMode(0);
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.left = '420px';
	this.stats.domElement.style.top = '8px';
	document.body.appendChild( this.stats.domElement );
	console.log(this.logCallsign + "stat module loaded.");
	
	this.renderer = new Renderer (this.stats, this.ctx, this.emitter);
	console.log(this.logCallsign + "renderer loaded.");
	
	this.canvas.width = 400;
	this.canvas.height = 400;
}

rbParticle.prototype.clear = function () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

rbParticle.prototype.update = function () {
	//Call renderer to update
	this.renderer.update();
}

rbParticle.prototype.draw = function () {
	//Call renderer to draw
	this.renderer.draw();
}

////////////////Start Renderer//////////////
function Renderer (stats, context, emitter) {
	this.stats = stats;
	this.ctx = context;
	this.emitter = emitter;
}

Renderer.prototype.update = function () {
	this.emitter.update();
}

Renderer.prototype.draw = function () {
	this.stats.begin();
	for(var i = 0; i < this.emitter.particleCount; i++) {
		var part = this.emitter.particlePool[i];
		var position = this.emitter.particlePool[i].position;
		this.ctx.fillStyle = 'rgba('+ part.r + ',' + part.g + ',' + part.b +','+ part.alpha +')';
		this.ctx.beginPath();
		this.ctx.arc(position.x, position.y, part.size, 0, Math.PI*2, true);
		this.ctx.fill();		
	}
	this.stats.end();
}


//Particles
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
	if(typeof(color)==='undefined') {
		this.r = 100;
		this.g = 100;
		this.b = 100;
	} else {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;	
	}
}

Particle.prototype.set = function (x, y, life, angle, speed, size, color) {
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
	if(typeof(color)==='undefined') {
		this.r = 100;
		this.g = 100;
		this.b = 100;
	} else {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;	
	}
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
///End particle Code

function Emitter(config) {

	this.logCallsign = "Emitter: ";
	console.log(this.logCallsign + "emitter started with config: " + JSON.stringify(config));
	//Apply configs
	this.totalParticles = config.totalParticles;
	this.delta = config.updateDelta;
	this.position = {
		x: config.x,
		y: config.y
	};
	this.configStr = config.configStr;
	
	this.particlePool = [];
	
	this.particleCount = 0;
	
	for(var i = 0; i< this.totalParticles; i++) {
		this.particlePool.push(new Particle());
	}
	console.log(this.logCallsign + "particle pool created with " + this.totalParticles + " particles");
}

Emitter.prototype.shouldEmitSomeParticles = function () {
	return (this.particleCount < this.totalParticles);
}

Emitter.prototype.update = function () {
	if(debug) {
		console.log(this.logCallsign + "updating with delta " + this.delta);
	}
	if(this.shouldEmitSomeParticles()) {
		this.addParticle(); //Particle Count Updates Here
	}
	
	var particleIndex = 0;
	while(particleIndex < this.particleCount) {
		//console.log(this.logCallsign + "updating particle " + particleIndex + " in the pool");
		var particle = this.particlePool[particleIndex];
		this.updateParticle(particle, particleIndex);
		particleIndex++;
	}
	if(debug)
		console.log(this.logCallsign + "update iteration complete");
};

Emitter.prototype.addParticle = function () {
	///Set particle properties based on config
	
	this.particlePool[this.particleCount].set(this.position.x, this.position.y, 10, Math.random() * 360 - 1, Math.random() * (20-8) + 8, 6, startColor);
	
	
	this.particleCount++;
	if(debug) {
		console.log(this.logCallsign + "particle emitted.");
		console.log(this.logCallsign + "current count: " + this.particleCount);
	}
};

Emitter.prototype.returnParticleToPool = function (index) {
	if(this.particleCount == 1) {
		this.particleCount--;
		return;
	}
	if(debug) {
		console.log(this.logCallsign + "particle " + index + " dead.");
		console.log(this.logCallsign + "replace it with: " + (this.particleCount - 1));
	}
	var deadParticle = this.particlePool[index];
	this.particlePool[index] = this.particlePool[this.particleCount - 1];
	this.particlePool[this.particleCount - 1] = deadParticle;
	this.particleCount--;
	//Update the swapped one
	this.updateParticle(this.particlePool[index], index);
};

Emitter.prototype.updateParticle = function (particle, particleIndex) {
	
	particle.life -= this.delta;
			
	if(particle.life > 0) {
		if(debug) {
			console.log(this.logCallsign + "updating particle: " + particleIndex);
			console.log(this.logCallsign + JSON.stringify(particle));
		}
		var ageRatio = particle.life / particle.originalLife;
		particle.size = particle.originalSize * ageRatio;
		particle.alpha = ageRatio;
		particle.position.x += particle.velocity.x * this.delta;
		particle.position.y += particle.velocity.y * this.delta;
		
		//Move Particle Here and change particle properties here.
		if(debug) {
			console.log(this.logCallsign + "particle alive: " + particleIndex);
			console.log(this.logCallsign + JSON.stringify(particle));
		}
	} else {
		if(debug) {
			console.log(this.logCallsign + "particle dead: " + particleIndex);
			console.log(this.logCallsign + JSON.stringify(particle));
		}
		this.returnParticleToPool(particleIndex);
	}
};
