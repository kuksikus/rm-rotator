;(function(
			$,
			window,
			document,
			undefined
		) {


	var defaults = {
		// add_zeros: 'false' // Add leading zeros if filename like 01, 02, ...
		// width: '300px'
		// height: '500px'
		zoom_max: '1.5',
		zoom_step: '0.2',
		// zoom: false
		rotate_delay: 40
	}


	function Rotator( element, options ) {
		if (options.count === undefined || options.start === undefined || options.prefix === undefined || options.postfix === undefined) {
			return false;
		}

		this.this_ = this;
		this.container = element;
		this.img = element.find('img:first');
		this.options = $.extend({}, defaults, options);
		this.defaults = defaults;
		this.init();
	}

	Rotator.prototype.init = function() {
		var this_ = this;
		this.preloader();
		this.container.css({
						'position': 'relative',
						'overflow': 'hidden'
					});
		this.img.css({
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'z-index': 5,
						'-webkit-touch-callout': 'none',
						'-webkit-user-select': 'none',
						'-khtml-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'user-select': 'none'
					});


		// Set sizes
		this.set_sizes();

		// Add controls
		this.add_controls();

		this.img.attr('src', this.options.prefix + this.options.start + this.options.postfix)

		this.zoom = 1;
		this.container.on('mousewheel DOMMouseScroll', function(e) {

			if (this_.options.zoom === false) {
				return true;
			}

			this_.options.zoom_max = this_.options.zoom_max - 0;
			this_.options.zoom_step = this_.options.zoom_step - 0;

			// Up or down?
			var delta = e.originalEvent.wheelDelta || e.originalEvent.detail * -40;
			if (delta > 0) {
				this_.zoom = this_.zoom + this_.options.zoom_step;

				if (this_.zoom > this_.options.zoom_max) {
					this_.zoom = this_.options.zoom_max;
				}
			}

			if (delta < 0) {
				this_.zoom = this_.zoom - this_.options.zoom_step;

				if (this_.zoom < 1) {
					this_.zoom = 1;
				}				
			}

			scale_style = {
						  '-webkit-transform': 'scale('+this_.zoom+')',
						     '-moz-transform': 'scale('+this_.zoom+')',
						      '-ms-transform': 'scale('+this_.zoom+')',
						       '-o-transform': 'scale('+this_.zoom+')',
						          'transform': 'scale('+this_.zoom+')'
						}

			this_.img.css(scale_style);

			return false;
		});


		var is_move = false;
		this.container.on('mousedown', function() {
			is_move = true;
		});

		this.container.on('dragstart', function() {
			return false;
		});

		$(document).on('mouseup', function() {
			is_move = false;
		});

		var prev_x = 0;
		this.position = this.options.start;
		$(document).on('mousemove', function(e) {

			// Fix mouseup missing outside browser
			if (e.which == 0) {
				is_move = false;
			}

			var pos = this_.position
			var speed = 0;
			if (is_move) {
				x = e.clientX;
				if (x > prev_x) {
					speed = x - prev_x;
					pos--;
					if (speed > 10) {
						pos = pos - 2;
					}
					if (speed > 20) {
						pos = pos - 3;
					}
				} else if (x < prev_x) {
					speed = prev_x - x;
					pos++;
					if (speed > 10) {
						pos = pos + 2;
					}
					if (speed > 20) {
						pos = pos + 3;
					}
				}

				if (pos < 0) {
					pos = this_.options.count - 1;
				} else if (pos >= this_.options.count) {
					pos = 0;
				}

				this_.rotate_to(pos);

				prev_x = x;
			}
		});
	}


	Rotator.prototype.rotate_to = function( position ) {

		if (position < 0) {
			position = this.options.count - 1;
		} else if (position >= this.options.count) {
			position = 0;
		}

		this.position = position;

		var zpos = position;
		if (this.options.add_zeros) {
			if (position < 10) {
				zpos = "0" + position;
			}
		}

		this.img.attr('src', this.options.prefix + zpos + this.options.postfix);
	}
	
	// Preload images
	Rotator.prototype.preloader = function() {

		// TODO Show loader

		imageObj = new Image();
		images = new Array();
		for (var i = this.options.start; i < this.options.count; i++) {
			zi = i;

			if (this.options.add_zeros) {
				if (i < 10) {
					zi = "0" + i;
				}
			}

			images.push(this.options.prefix + zi + this.options.postfix);
		}

		// start preloading
		for (var i = 0; i < images.length; i++) {
			imageObj.src=images[i];
		}

		$(window).on('load', function() {
			// TODO Hide loader
		});

	}

	// Set image and block sizes
	Rotator.prototype.set_sizes = function() {
		var this_ = this;
		if (this.options.width) {
			this.container.css('width', this.options.width);
			this.img.css('width', this.options.width);
		}

		if (this.options.height) {
			this.container.css('height', this.options.height);
			this.img.css('height', this.options.height);
		}

		// Auto set size to block after load first image
		if (!this.options.width || !this.options.height) {
			this.img.on('load', function() {
				var width = this_.img.width();
				var height = this_.img.height();
				this_.container.css({
								width: width,
								height: height
					});
			});
		}
	}

	Rotator.prototype.add_controls = function() {
		var this_ = this;
		if (!this.options || !this.options.controls) {
			return false;
		}

		var controls = $('<div>', {
									class: 'rm-present_controls'
		}).appendTo(this.container);

		controls.css({
						width: '100%',
						height: '100%',
						position: 'absolute',
						zIndex: 7
		});

		for (key in this.options.controls) {
			if (this.options.controls[key] == 'rotate') {
				var rotate_control = $('<img>', {
													opacity: 0,
													src: 'images/rotate.png'
				});

				rotate_control.css({
										position: 'absolute',
										bottom: '10px',
										left: '50%'
				});

				$(rotate_control).appendTo(controls);

				rotate_control.on('click', function() {
					this_.auto_rotate(this_);
				});
			}
		}
	}

	Rotator.prototype.auto_rotate = function(rotator) {
		delay = rotator.options.rotate_delay - 0;

		if (!rotator.is_rotate) {
			rotator.is_rotate = setInterval(function() {
				var position = rotator.position;
				position++;
				rotator.rotate_to(position);
			}, delay);
		} else {
			clearInterval(rotator.is_rotate);
			rotator.is_rotate = false;
		}
	}
	
	$.fn.Rotator = function(options) {
		return new Rotator( $(this.selector), options );
	}


})(jQuery, window, document);