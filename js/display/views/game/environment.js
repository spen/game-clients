'use strict';

function getCanvas(id) {
	var canvas = document.getElementById(id);
	return canvas && canvas.nodeName === 'CANVAS' ? canvas : false;
}

function getContext(id, contextType) {
	contextType = contextType || '2d';
	var canvas = getCanvas(id);
	return canvas ? canvas.getContext(contextType) : false;
}

function preloadImages(images) {
	var deferred = new $.Deferred(),
		loader = new Image(),
		total = images.length,
		count = 0;

		loader.onload = function(){
			count += 1;

			if (count === total) {
				deferred.resolve();
			} else {
				loader.src = images.pop();
			}
		};

		loader.src = images.pop();

	return deferred;
}

var _ = require('underscore'),
	ViewExtension = require('../../../extensions/view'),
	template = require('../../templates/game/environment.hbs'),

	EnviromentView = ViewExtension.extend({

		template: template,

		acceptedParams: ['socket', 'cameraModel', 'height', 'width'],

		isReady: false,

		currentX: 0,

		currentY: 0,

		initialize: function() {
			var loader,
				mapData = window.initialData.map;
			this._super.apply(this, arguments);

			window.game = this;

			loader = preloadImages(['images/exampleTileSet.png']);

			if (loader.state() === 'resolved') {
				this.ready();
			} else {
				loader.then(this.ready.bind(this));
			}

			this.mapImage = new Image();
  			this.mapImage.src = 'images/exampleTileSet.png';

  			this.currentMap = mapData.maps[mapData.defaultMap];

  			// this.socket.on('control press', this.onControlPress.bind(this));

			// this.listenTo(this.cameraModel, 'change', this.translateAll.bind(this));
			console.log(this.cameraModel);
			this.listenTo(this.cameraModel, 'updated', this.translateAll.bind(this));
		},

		onControlPress: function (data) {
			var message = data.message;
			if (message === 'up') {
				this.translateAll(0, 50);
			}

			if (message === 'down') {
				this.translateAll(0, -50);
			}

			if (message === 'left') {
				this.translateAll(50, 0);
			}

			if (message === 'right') {
				this.translateAll(-	50, 0);
			}
		},

		setContexts: function () {
			var baseCtx = getContext('base'),
				coverCtx = getContext('cover'),
				propsCtx = getContext('props');

			this.contexts = {
				base: baseCtx,
				cover: coverCtx,
				props: propsCtx
			};

			window.base = this.contexts.base;
		},

		render: function () {
			this._super.apply(this, arguments);
			this.setContexts();
			this.draw();
		},

		draw: function () {
			var map = this.model.getCurrentMap(),
				tiles = map.get('tileMap');
				// avoiding having to .get() for each draw of each tile...
				this.currentMap = map;
			_.each(tiles, this.drawTile.bind(this));
		},

		drawTile: function (tile, i) {
			var tileType = this.currentMap.attributes.tileTypes[tile],
				x = i % this.currentMap.attributes.tilesX,
				y = Math.floor(i / this.currentMap.attributes.tilesX),
				currentMap = this.currentMap,
				tileSize = currentMap.attributes.tileSize,
				contexts = this.contexts,
				image = this.mapImage;

			var canvasWidth = 600,
				canvasHeight = 400;

				// debugger;
				//
			var translateX = this.cameraModel.x,
				translateY = this.cameraModel.y;

			var inBounds = 	x * tileSize < - translateX + canvasWidth &&
                    		y * tileSize < - translateY + canvasHeight &&
                    		(x + 1) * tileSize > - translateX &&
                    		(y + 1) * tileSize > - translateY;

			if (!inBounds) {
				return false;
			}

	    	_.each([
	    		'base',
	    		'props',
	    		'cover'
	    	], function(id){
	    		var tile = tileType[id],
		    		srcX = tile % currentMap.attributes.tileSet.tilesX,
					srcY = Math.floor(tile / currentMap.attributes.tileSet.tilesX);

		    	contexts[id].drawImage(
			        image, // image
			        srcX * tileSize, // source x start
					srcY * tileSize, // source y start
					tileSize, // source x width
					tileSize, // source y height
					x * tileSize, // placement x
					y * tileSize, // placement y
					tileSize, // height
					tileSize // width
		    	);
	    	});
		},

		translateAll: function () {
			var x = this.cameraModel.x;
			var y = this.cameraModel.y;

			// console.log(x,y);

			// console.log(x,y);
		    _.each([
		    	this.contexts.base,
		    	this.contexts.cover,
		    	this.contexts.props
		    ], function(context) {
		    	// context.clearRect(0, 0, this.width + 50 - this.cameraModel.x, this.height + 50 - this.cameraModel.y);
		    	context.clearRect(0, 0, this.width, this.height);
		    	context.save();

		    	// console.log(x, y);

		    	context.translate(x, y);

		    }, this);

		    // this.currentX = this.cameraModel.x;
		    // this.currentY = this.cameraModel.y;

		    this.draw();

		    _.each([
		    	this.contexts.base,
		    	this.contexts.cover,
		    	this.contexts.props
		    ], function(context) {
		    	context.restore();
		    });
		},

		serialize: function () {
			return {
				gameWidth: this.width + 'px',
				gameHeight: this.height + 'px'
			};
		}
	});

module.exports = EnviromentView;