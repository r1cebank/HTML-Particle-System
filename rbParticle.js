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
	 updateDelta: 0.1,
	 x: 200,
	 y: 200,
	 configStr: "config:test"
	 
 };

 /* End Test */
 
//Particle System

function rbParticle (cvName) {
	
	this.logCallsign  = "rbParticle: ";
	console.log(this.logCallsign + "engine started for canvas: " + cvName);
	
	this.canvas = document.getElementById(cvName);
	var ctx = this.canvas.getContext('2d');
	
	//Stats
	this.stats = new Stats();
	this.stats.setMode(0);
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.left = '420px';
	this.stats.domElement.style.top = '8px';
	document.body.appendChild( this.stats.domElement );
	console.log(this.logCallsign + "stat module loaded.");
	this.canvas.width = 400;
	this.canvas.height = 400;
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

Emitter.prototype.update = function (delta) {
	if(debug) {
		console.log(this.logCallsign + "updating with delta " + delta);
	}
	while(this.particleCount < this.totalParticles) {
		this.addParticle(); //Particle Count Updates Here
	}
	
	var particleIndex = 0;
	while(particleIndex < this.particleCount) {
		//console.log(this.logCallsign + "updating particle " + particleIndex + " in the pool");
		var particle = this.particlePool[particleIndex];
		this.updateParticle(delta, particle, particleIndex);
		particleIndex++;
	}
};

Emitter.prototype.addParticle = function () {
	///Set particle properties based on config
	this.particlePool[this.particleCount] = null;
	delete this.particlePool[this.particleCount];
	this.particlePool[this.particleCount] = new Particle(2, 1, 10, 10, 1, 2, 12);
	this.particleCount++;
};

Emitter.prototype.returnParticleToPool = function (index) {
	var deadParticle = this.particlePool[index];
	this.particlePool[index] = this.particlePool[this.particleCount - 1];
	this.particlePool[this.particleCount - 1] = deadParticle;
	this.particleCount--;
};

Emitter.prototype.updateParticle = function (delta, particle, particleIndex) {
		
	if(particle.life > 0) {
		if(debug) {
			console.log(this.logCallsign + "updating particle: " + particleIndex);
			console.log(this.logCallsign + JSON.stringify(particle));
		}
		particle.life -= delta;
		var ageRatio = particle.life / particle.originalLife;
		particle.size = particle.originalSize * ageRatio;
		particle.alpha = ageRatio;
		particle.position.x += particle.velocity.x * delta;
		particle.position.y += particle.velocity.y * delta;
		
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
