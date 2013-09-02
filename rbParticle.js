/*
 *  rbParticle - r1cebank Particle Engine
 *  copyright 2013-2014 r1cebank
 *  simple particle engine using Javascript
 *
 */
 
 /* Test */
 
var debug = 0;
var cfg = {
	totalParticles: 200,
	updateDelta: 0.05,
	particleLife: 10,
	emissionRate: 20,
	particleSize: 6,
	minAngle: 70,
	maxAngle: 110,
	endSize: 6,
	maxX: 400,
	maxY: 400,
	minX: 0,
	minY: 0,
	startColor: {
		r: 20,
		g: 100,
		b: 200
	},
	endColor: {
		r: 255,
		g: 84,
		b: 47
	},
	position: {
		x: 200,
		y: 200
	},
	startAlpha: 0.8,
	endAlpha: 0.4,
	startColorVar: 20,
	endColorVar: 20,
	velocity: 40,
	velocityVar: 0,
	sizeVal: 0,
	useTexture: false,
	texture: "texture.png",
	textureSize: {
		width: 32,
		height: 32
	},
	configStr: "config:test"
};

var phys = {
	gravity: {
		x: 0,
		y: 0
	},
	radialAccel: 0,
	tangentialAccel: 0
};

 /* End Test */
 
 ///////////////Utils////////////
 
function sleep(milliseconds) {
	var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}
 
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

var bufferCache = {};

function getBuffer(texture) {
	var size = '' + texture.width + 'x' + texture.height;

	var canvas = bufferCache[size];

	if(!canvas) {
		canvas = document.createElement('canvas');
		canvas.width = texture.width;
		canvas.height = texture.height;
		bufferCache[size] = canvas;
	}

	return canvas;
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
	//Call renderer to draw()
	if(this.emitter.useTexture)
		this.renderer.drawTexture();
	else
		this.renderer.draw();
}

////////////////Start Physics Engine//////////////

function PhysicsE (config) {
	this.logCallsign = "PhysicsE: ";
	console.log(this.logCallsign + "initialize physics engine.");
	console.log(JSON.stringify(config));
	this.gravity = config.gravity;
	this.radialAccel = config.radialAccel;
	this.tangentialAccel = config.tangentialAccel;
	
	//Forces
	this.forces = new Vector(0, 0);
	
}

PhysicsE.prototype.updateParticle = function (particle, emitter) {
	if(debug)
		console.log(this.logCallsign + "updating particle.");
	//Forces
	particle.forces = particle.forces || new Vector(0, 0);
	particle.radial = particle.radial || new Vector(0, 0);
	//No radial force when particle is close to the emitter
	if((particle.position != emitter.position.x || particle.position.y != emitter.position.y) && (this.radialAccel || this.tangentialAccel)) {
		//Set radial
		particle.radial.x = particle.position.x - emitter.position.x;
		particle.radial.y = particle.position.y - emitter.position.y;
		
		particle.radial.normalize();

	}
	particle.tangential = particle.tangential || new Vector(0, 0);
	//Set tangential vector
	particle.tangential.x = particle.radial.x;
	particle.tangential.x = particle.radial.x
	//Set radial from acceleration
	particle.radial.x *= this.radialAccel;
	particle.radial.y *= this.radialAccel;
	
	var tempX = particle.tangential.x;
	particle.tangential.x = - particle.tangential.y;
	particle.tangential.y = tempX;
	
	particle.tangential.x *= this.tangentialAccel;
	particle.tangential.y *= this.tangentialAccel;
	
	
	particle.forces.x = particle.radial.x + particle.tangential.x + this.gravity.x;
	particle.forces.y = particle.radial.y + particle.tangential.y + this.gravity.y;
	
	particle.forces.x *= emitter.delta;
	particle.forces.y *= emitter.delta;
	
	particle.velocity.add(particle.forces);
}

///////////////Vectors///////////////

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

Vector.prototype.fromAngle = function (angle, magnitude) {
	return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

Vector.prototype.normalize = function () {
	var length = this.getMagnitude();

	this.x /= length;
	this.y /= length;
}


///////////////End Physics Engine/////////////////

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
		this.ctx.fillStyle = 'rgba('+ Math.round(part.color.r) + ',' + Math.round(part.color.g) + ',' + Math.round(part.color.b) +','+ part.color.a +')';
		this.ctx.beginPath();
		this.ctx.arc(position.x, position.y, part.size, 0, Math.PI*2, true);
		this.ctx.fill();		
	}
	this.stats.end();
}

Renderer.prototype.drawTexture = function () {
	this.stats.begin();

	for(var i = 0; i < this.emitter.particleCount; i++) {
		var part = this.emitter.particlePool[i];
		var position = this.emitter.particlePool[i].position;
		part.buffer = part.buffer || getBuffer(this.emitter.textureImg);

		var bufferContext = part.buffer.getContext('2d');
		
		//Draw particles with texture
		var w = (this.emitter.textureImg.width * (part.size / part.originalSize)) | 0;
		var h = (this.emitter.textureImg.height * (part.size / part.originalSize)) | 0;
		
		var x = part.position.x - w / 2;
		var y = part.position.y - h / 2;
		
		bufferContext.clearRect(0, 0, part.buffer.width, part.buffer.height);
		bufferContext.globalAlpha = part.color.a;
		bufferContext.drawImage(this.emitter.textureImg, 0, 0);
		
		//source-atop
		bufferContext.globalCompositeOperation = "source-atop";
		bufferContext.fillStyle = 'rgba('+ Math.round(part.color.r) + ',' + Math.round(part.color.g) + ',' + Math.round(part.color.b) + ', 1' + ')';
		bufferContext.fillRect(0, 0, part.buffer.width, part.buffer.height);
		
		//Reset fill style and operation
		bufferContext.globalCompositeOperation = "source-over";
		bufferContext.globalAlpha = 1;
		
		this.ctx.drawImage(part.buffer, 0, 0, part.buffer.width, part.buffer.height, x, y, w, h);		
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
	this.velocity = new Vector(speed * Math.cos(angleInRadians),-speed * Math.sin(angleInRadians));
	this.buffer = null;
	this.originalLife = this.life = life;
	this.color = color;
	this.originalSize = this.size = size;
	if(typeof(color)==='undefined') {	
		this.color = {
			r: 100,
			g: 100,
			b: 100,
			a: 1
		}
	}
}

Particle.prototype.set = function (x, y, life, angle, speed, size, color) {
	this.position = {
		x: x,
		y: y
	};
	
	var angleInRadians = angle * Math.PI / 180;
	this.velocity.x = speed * Math.cos(angleInRadians);
	this.velocity.y = -speed * Math.sin(angleInRadians);
	this.originalLife = this.life = life;
	this.color = color;
	this.originalSize = this.size = size;
	if(typeof(color)==='undefined') {
		if(typeof(color)==='undefined') {	
			this.color = {
				r: 100,
				g: 100,
				b: 100,
				a: 1
			}
		}
	}
}

///End particle Code

function Emitter(config) {

	this.logCallsign = "Emitter: ";
	console.log(this.logCallsign + "emitter started with config: ");
	console.log(JSON.stringify(config));
	
	this.phys = new PhysicsE (phys);
	
	//Apply configs
	this.position = config.position;
	this.totalParticles = config.totalParticles;
	this.particleLife = config.particleLife;
	this.delta = config.updateDelta;
	this.sizeVal = config.sizeVal;
	
	this.startColor = config.startColor;
	this.endColor = config.endColor;
	this.startColorVar = config.startColorVar;
	this.endColorVar = config.endColorVar;
	
	this.particleSize = config.particleSize;
	this.endSize = config.endSize;
	
	this.velocity = config.velocity;
	this.velocityVar = config.velocityVar;
	
	//Emission Rate
	this.emissionRate = config.emissionRate;
	this.emitCounter = 0;
	
	//Alpha
	this.startAlpha = config.startAlpha;
	this.endAlpha = config.endAlpha;
	this.deltaAlpha = (this.endAlpha - this.startAlpha) / (this.particleLife / this.delta);
	
	//Screen bound
	this.maxX = config.maxX;
	this.maxY = config.maxY;
	this.minX = config.minX;
	this.minY = config.minY;
	
	//Angle
	this.minAngle = config.minAngle;
	this.maxAngle = config.maxAngle;
	
	//Texture
	this.textureImg = new Image(); 
	this.useTexture = config.useTexture;
	this.texture = config.texture;
	this.textureSize = config.textureSize;
	if(this.useTexture) {
		console.log(this.logCallsign + "loading texture.");
		this.textureImg.src = this.texture;
		if((this.textureImg.width == 0 ) || (this.textureImg.height == 0)) {
			//this.useTexture = false;
			this.textureImg.width = this.textureSize.width;
			this.textureImg.height = this.textureSize.height;
		}
		console.log(this.logCallsign + "texture loaded");
		console.log(this.logCallsign + "texture width: " + this.textureImg.width + " texture height: " + this.textureImg.height);
	}
	
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

/*
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
*/

Emitter.prototype.isFull = function () {
	return (this.particleCount >= this.totalParticles);
}

Emitter.prototype.update = function () {
	if(debug) {
		console.log(this.logCallsign + "updating with delta " + this.delta);
	}
	/*if(this.shouldEmitSomeParticles()) {
		this.addParticle(); //Particle Count Updates Here
	}*/
	if(this.emissionRate) {
		var rate = 1.0 / this.emissionRate;
		this.emitCounter += this.delta;
		
		while(!this.isFull() && this.emitCounter > rate) {
			this.addParticle();
			this.emitCounter -= rate;
		}
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
		b: limit255(this.startColor.b + Math.round(this.startColorVar * random11())),
		a: this.startAlpha
	};

	
	this.particlePool[this.particleCount].set(eval(this.position.x) , eval(this.position.y), this.particleLife, random(this.minAngle, this.maxAngle, false), (this.velocity + this.velocityVar * random11()), this.particleSize + this.sizeVal * random11(), startColor);
	
	
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
		
		//Update particle from physics engine
		this.phys.updateParticle(particle, this);
		
		if(debug) {
			console.log(this.logCallsign + "updating particle: " + particleIndex);
			console.log(this.logCallsign + JSON.stringify(particle));
		}
		var ageRatio = particle.life / particle.originalLife;

		//particle.alpha = ageRatio;
		particle.position.x += particle.velocity.x * this.delta;
		particle.position.y += particle.velocity.y * this.delta;
		particle.color.r += this.deltaColor.r;
		particle.color.g += this.deltaColor.g;
		particle.color.b += this.deltaColor.b;
		
		//New Alpha calculation
		particle.color.a += this.deltaAlpha;
		
		//New Size calculation
		var deltaSize = (this.endSize - particle.originalSize) / (particle.originalSize / this.delta);
		particle.size += deltaSize;
		
		if(particle.size < 1) {
			this.returnParticleToPool(particleIndex);
			return;
		}
		
			
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
