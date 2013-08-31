/*
 *  rbParticle - r1cebank Particle Engine
 *  copyright 2013-2014 r1cebank
 *  simple particle engine using Javascript
 *
 */
 
 /* Test */
 
var debug = 0;
var cfg = {
	totalParticles: 500,
	updateDelta: 0.05,
	particleLife: 10,
	emissionRate: 10,
	particleSize: 5,
	minAngle: 50,
	maxAngle: 130,
	endSize: 10,
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
		x: "Math.random() * 400",
		y: "Math.random() * 400"
	},
	startAlpha: 0.8,
	endAlpha: 0.4,
	startColorVar: 20,
	endColorVar: 20,
	velocity: 20,
	velocityVar: 0,
	sizeVal: 2,
	useTexture: false,
	texture : "texture.png",
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
	this.velocity = {
		x: speed * Math.cos(angleInRadians),
		y: -speed * Math.sin(angleInRadians)
	};
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
	this.velocity = {
		x: speed * Math.cos(angleInRadians),
		y: -speed * Math.sin(angleInRadians)
	};
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
	console.log(this.logCallsign + "emitter started with config: " + JSON.stringify(config));
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
	if(this.useTexture) {
		this.textureImg.src = this.texture;
		if((this.textureImg.width == 0 ) || (this.textureImg.height == 0)) {
			//this.useTexture = false;
			this.textureImg.width = 32;
			this.textureImg.height = 32;
		}
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
