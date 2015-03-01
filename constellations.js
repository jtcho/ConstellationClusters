/**
 * Constellation Clusters
 * ----------------------
 * Two hour project on a Sunday afternoon. (i.e. me being sick in bed)
 * 
 * Modified heavily from http://codepen.io/acauamontiel/pen/mJdnw.
 * @author - JT Cho <jtcho.me>, Acaua Montiel <contato@acauamontiel.com.br>
 */

/*
 * requestAnimationFrame pollyfill
 */
var reqAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
	window.setTimeout(callback, 1000 / 60);
};

/*
 * Function: generatePastelColor
 * -----------------------------
 * Returns a random pastel color tuple.
 * Achieves 'pastel' color by averaging a random color with WHITE.
 */
function generatePastelColor() {
	var r = Math.ceil(((Math.random() * 255) + 255)/2);
	var g= Math.ceil(((Math.random() * 255) + 255)/2);
	var b = Math.ceil(((Math.random() * 255) + 255)/2);

	return { red: r, green: g, blue : b};
};

/*
 * Module: Constellations
 * -----------------------
 * Creates a pretty constellation visualizer. :)
 */
function Constellations (canvas) {
	var _this = this,
      canvas = $(canvas)[0],
      ctx = canvas.getContext('2d');

    /*
     * CONFIGURATION BLOCK
     */
	_this.config = {
		star: {
			color: 'rgba(255, 255, 255, .5)'
		},
		line: {
			color: 'rgba(79, 142, 220, .5)',
			width: 0.1
		},
		clusters: [],

		scale: 1,				//Canvas scale (zoom).
		canvas_width: 500, 
		canvas_height: 500,

		num_clusters: 10,		//Number of constellation clusters.
		velocity: 0.2,			//Base velocity, v0.
		velocity_var: 0.4,		//Velocity variance; star velocity = v0 - rand(velocity_var).
		cluster_size: 300,		//Number of stars in each cluster.
		radius: 150,			//Radius to draw edges from star to cluster core.
		spread: 800				//Initial range of spread of stars from cluster core.
	};

	/*
	 * Object: Cluster
	 * ---------------
	 * Represents a cluster of stars.
	 * Stars within a cluster can form edges
	 * with each other when they are within
	 * a certain radius of the cluster core.
	 */
	function Cluster() {
		this.stars = [];
		this.core = {
			x: Math.random() * canvas.width, 
			y: Math.random() * canvas.height,
			vx : (_this.config.velocity - (Math.random() * _this.config.velocity_var)),
			vy : (_this.config.velocity - (Math.random() * _this.config.velocity_var))
		};
		this.length = Math.ceil(_this.config.cluster_size * Math.random()) + 1;
		var col = generatePastelColor();
		this.strokeStyle = 'rgba(' + col.red + ', ' + col.green + ', ' + col.blue + ', 0.4)';

	};

	Cluster.prototype = {

		animate: function() {
			this.updateCore();

			for (var i = 0; i < this.stars.length; i++) {
				this.stars[i].tick();
			}
		},

		updateCore : function() {
			var core = this.core;
			if(core.y < 0 || core.y > canvas.height){
				core.vy *= -1;
			}
			else if(core.x < 0 || core.x > canvas.width){
				core.vx *= -1;
			}
			core.x += core.vx;
			core.y += core.vy;
		},

		createStars : function () {
			var length = this.length,
				star;

			for(var i = 0; i < length; i++){
				this.stars.push(new Star(this.core));
				this.stars[i].create();
			}
		},

		updateStars : function() {
			var length = this.length,
				star;

			for(var i = 0; i < length; i++){
				this.stars[i].create();
			}
		},

		line : function() {
			ctx.strokeStyle = this.strokeStyle;
			for (var i = 0; i < this.length; i++) {
				for (var j = 0; j < this.length; j++) {
					if (i != j) {
						var iStar = this.stars[i];
						var jStar = this.stars[j];

						if(iStar.distTo(jStar) < _this.config.radius && iStar.distTo(this.core) < _this.config.radius) {
							ctx.beginPath();
							ctx.moveTo(iStar.x, iStar.y);
							ctx.lineTo(jStar.x, jStar.y);
							ctx.stroke();
							ctx.closePath();
						}
					}
				}
			}
		}

	};

	/*
	 * Object: Star
	 * ------------
	 * Represents a star on the canvas, handles 
	 * drawing and individual animation.
	 */
	function Star (core) {
		var r = _this.config.spread;
		this.x = Math.abs((core.x - r/2) + Math.random() * r) % canvas.width;
		this.y = Math.abs((core.y - r/2) + Math.random() * r) % canvas.height;

		this.vx = (_this.config.velocity - (Math.random() * _this.config.velocity_var));
		this.vy = (_this.config.velocity - (Math.random() * _this.config.velocity_var));

		this.radius = Math.random()*0.8;
	};

	Star.prototype = {
		create: function(){
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
			ctx.fill();
		},

		distTo: function(star2) {
			return Math.sqrt(Math.pow(this.x - star2.x, 2) + Math.pow(this.y - star2.y, 2));
		},

		tick: function(){
			if(this.y < 0 || this.y > canvas.height){
				this.vy *= -1;
			}
			else if(this.x < 0 || this.x > canvas.width){
				this.vx *= -1;
			}
			this.x += this.vx;
			this.y += this.vy;
		},
	};

	_this.setCanvas = function () {
		canvas.width = _this.config.canvas_width;
		canvas.height = _this.config.canvas_height;
	};

	_this.setContext = function () {
		ctx.fillStyle = _this.config.star.color;
		ctx.lineWidth = _this.config.line.width;
		ctx.scale(_this.config.scale,_this.config.scale);
	};

	/*
	 * Function: loop
	 * --------------
	 * Loops a particular callback function for each
	 * animation frame.
	 */
	_this.loop = function (callback) {
		callback();

		reqAnimFrame(function () {
			_this.loop(function () {
				callback();
			});
		});
	};

	/*
	 * Function: createClusters
	 * ------------------------
	 * Initializes all of the clusters and their stars.
	 */
	_this.createClusters = function() {
		for (var i = 0; i < _this.config.num_clusters; i++) {
			_this.config.clusters.push(new Cluster());
			_this.config.clusters[i].createStars();
		}
	};

	/*
	 * Function: tick
	 * ------------------------
	 * At each iterative step, updates the star
	 * clusters.
	 */
	_this.tick = function() {
		var cluster, i;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (i = 0; i < _this.config.num_clusters; i++) {
			cluster = _this.config.clusters[i];
			cluster.updateStars();
			cluster.line();
			cluster.animate();
		}
	};

	/*
	 * Function: init
	 * --------------
	 * Initializes the module.
	 */
	_this.init = function () {
		_this.setCanvas();
		_this.setContext();
		_this.createClusters();

		_this.loop(function () {
			_this.tick();
		});
	};
  
  	_this.init();

  	return _this.config;
}

/*
 * Create the module!
 */
$(document).ready(function() {
	Constellations('canvas');
});



