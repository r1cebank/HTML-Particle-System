/*
 *  rbParticle - r1cebank Particle Engine
 *  copyright 2013-2014 r1cebank
 *  simple particle engine using Javascript
 *
 */
 
 /* Test */
 
var debug = 0;
var cfg = {
	totalParticles: 100,
	updateDelta: 0.5,
	particleLife: 5,
	particleSize: 10,
	maxX: 400,
	maxY: 400,
	minX: 0,
	minY: 0,
	x: 200,
	y: 200,
	startColor: {
		r: 73,
		g: 196,
		b: 190
	},
	endColor: {
		r: 232,
		g: 214,
		b: 42
	},
	startColorVar: 20,
	endColorVar: 20,
	velocity: 0,
	velocityVar: 0,
	sizeVal: 4,
	configStr: "config:test"
};

 /* End Test */
 
 ///////////////Utils////////////
 
function isInteger (num) {
	 return num === (num | 0);
}
 
function isNumber (i) {
	return typeof i === 'number';
}

function random11 () {
			return this.random(-1, 1, true);
}

function limit255(number) {
	return (number > 255) ? 255 : number;
}

function random(minOrMax, maxOrUndefined, dontFloor) {
	dontFloor = dontFloor || false;
	
	var min = this.isNumber(maxOrUndefined) ? minOrMax: 0;
	var max = this.isNumber(maxOrUndefined) ? maxOrUndefined: minOrMax;
	
	var range = max - min;
	
	var result = Math.random() * range + min;
	
	if (this.isInteger(min) && this.isInteger(max) && ! dontFloor) {
		return Math.floor(result);
	} else {
			return result;
		}
	}
 
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
		this.ctx.fillStyle = 'rgba('+ Math.round(part.r) + ',' + Math.round(part.g) + ',' + Math.round(part.b) +','+ part.alpha +')';
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
	this.particleLife = config.particleLife;
	this.delta = config.updateDelta;
	this.position = {
		x: config.x,
		y: config.y
	};
	this.sizeVal = config.sizeVal;
	
	this.startColor = config.startColor;
	this.endColor = config.endColor;
	this.startColorVar = config.startColorVar;
	this.endColorVar = config.endColorVar;
	
	this.particleSize = config.particleSize;
	
	this.velocity = config.velocity;
	this.velocityVar = config.velocityVar;
	
	//Screen bound
	this.maxX = config.maxX;
	this.maxY = config.maxY;
	this.minX = config.minX;
	this.minY = config.minY;
	
	this.deltaColor = {
		r: (this.endColor.r - this.startColor.r) / (this.particleLife / this.delta),
		g: (this.endColor.g - this.startColor.g) / (this.particleLife / this.delta),
		b: (this.endColor.b - this.startColor.b) / (this.particleLife / this.delta)
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
	if (this.particleCount < this.totalParticles) {
		if(Math.random() > 0.5)
			return true;
		else
			return false;
	} else {
		return false;
	}
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
	
	var startColor = {
		r: limit255(this.startColor.r + Math.round(this.startColorVar * random11())),
		g: limit255(this.startColor.g + Math.round(this.startColorVar * random11())),
		b: limit255(this.startColor.b + Math.round(this.startColorVar * random11()))
	};

	
	this.particlePool[this.particleCount].set(Math.round(Math.random() * 400), Math.round(Math.random() * 400), this.particleLife, Math.random() * 360, (this.velocity + this.velocityVar * random11()), this.particleSize + this.sizeVal * random11(), startColor);
	
	
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
		particle.r += this.deltaColor.r;
		particle.g += this.deltaColor.g;
		particle.b += this.deltaColor.b;
		
		if((particle.position.x < this.minX) || (particle.position.x > this.maxX) ||
			(particle.position.y < this.minY) || (particle.position.y > this.maxY)) {
				//Discard out of bounds particles
				this.returnParticleToPool(particleIndex);
				return;
			}
		
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
