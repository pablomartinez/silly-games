;(function() {

  var Game = function() {
		var canvas = document.getElementById("screen");
    var screen = canvas.getContext('2d');
		this.position = canvas.getBoundingClientRect();
		this.pointer = new Pointer(canvas, this);
		this.counter = { missed: new Counter(this, 'counter_missed'),
										 exploded: new Counter(this, 'counter_exploded'), };
    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.bodies = [];
    this.sounds = { shoot:  document.getElementById('sound-shoot'),
										pop:  document.getElementById('sound-pop') };
		this.images = { balloon: new Image() };
		this.images.balloon.src = 'img/balloon.png';
    var self = this;
		var tick = function() {
      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };
    tick();

  };

  Game.prototype = {
    update: function() {
			if (Math.random() > 0.995) {
				var posx = Math.random() * this.size.x;
				this.addBody(new Balloon(this, {x: posx , y: this.size.y}));
		}

      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].update !== undefined) {
          this.bodies[i].update();
        }
      }
    },

    draw: function(screen) {
      screen.clearRect(0, 0, this.size.x, this.size.y);
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].draw !== undefined) {
          this.bodies[i].draw(screen);
        }
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

    removeBody: function(body) {
      var bodyIndex = this.bodies.indexOf(body);
      if (bodyIndex !== -1) {
        this.bodies.splice(bodyIndex, 1);
      }
    },


		findObject: function(x, y) {
		  result = [];
		  for(var i = 0; i < this.bodies.length ; i++) {
			  b = this.bodies[i];
				if( b.center.x + b.size.x / 2 >= x &&
						b.center.y + b.size.y / 2 >= y &&
						b.center.x - b.size.x / 2 <= x &&
						b.center.y - b.size.y / 2 <= y ) {
					b.remove()
					result.push(b);
				}
		  }
		  return result;
		},
  };

  var Balloon = function(game, center) {
    this.game = game;
    this.center = center;
    this.size = { x: 64, y: 100 };
    this.speedY = Math.random() + 0.3;
  };

  Balloon.prototype = {
    update: function() {
      this.center.y -= this.speedY;
			if ( this.center.y < -this.size.y ) {
				this.game.counter.missed.increment();
				this.game.sounds.shoot.load();
				this.game.sounds.shoot.play()
				this.game.removeBody(this);
		  };
    },

    draw: function(screen) {
			var _posx = this.center.x - this.size.x / 2;
			var _posy = this.center.y - this.size.y / 2;
			screen.drawImage(this.game.images.balloon, _posx, _posy);
    },

		remove: function() {
			this.game.counter.exploded.increment();
			this.game.sounds.pop.load();
			this.game.sounds.pop.play();
			this.game.removeBody(this);
		},
  };

	var Counter = function(game, dom_id, value) {
		if(typeof(value)==='undefined') value = 0;
		this.game = game;
		this.dom = document.getElementById(dom_id);
		this.value = value;
  }

  Counter.prototype = {
		update: function() {
			if(document.all) {
					this.dom.innerText = document.createTextNode(this.value).textContent;
		  } else {
					this.dom.textContent = document.createTextNode(this.value).textContent;
      }
		},

		increment: function() {
			this.value += 1;
			this.update();
		},

		decrement: function() {
			this.value -= 1;
			this.update();
		},

		set: function(value) {
			this.value = value;
			this.update();
		},
	};

  var Pointer = function(canvas, game) {
	  this.game = game;
  	this.position = game.position;
	  self = this;
    canvas.addEventListener('click', function(e) {
	  	if (!e) var e = window.event;
		  var _mousex = e.clientX - self.position.left;
  		var _mousey =  e.clientY - self.position.top;
	  	balloons = self.game.findObject(_mousex, _mousey);
  	});
  };

  var drawRect = function(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x,
                    body.size.y);
  };


  window.addEventListener('load', function() {
    new Game();
  });
})();
