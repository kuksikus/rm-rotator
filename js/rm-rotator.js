(function(
			$,
			window,
			document,
			undefined
		) {

	'use strict';

	var defaults = {
		// add_zeros: 'false', // Add leading zeros if filename like 01, 02, ...
		// width: '300px',
		// height: '500px',
		start: 0,
		zoom_max: '2',
		zoom_step: '0.2',
		// zoom: false
		rotate_delay: 40,
		// auto_rotate: false,
		rotate: false,
		progress: true
	}


	function Rotator( element, options ) {

		if (options.count === undefined) {
			var list_images = element.find('img');
			if (list_images.length > 0) {
				this.list_images = list_images;
				options.count = list_images.length;
			}
		}

		if (options.count !== undefined && options.start !== undefined) {

			if (this.list_images !== undefined || (options.prefix !== undefined && options.postfix !== undefined)) {
				this.container = element;
				this.container.empty();
				this.loaded = 0;
				this.current = options.start;

				var scroll = $('<div>');
				scroll.appendTo(this.container);
				this.scroll = scroll;

				var loader = $('<div>', {
											class: 'rm-rotator_loader'
				});
				loader.appendTo(this.container);
				this.loader = loader;

				this.options = $.extend({}, defaults, options);

				this.init();
			}
		}
	}

	Rotator.prototype.init = function() {
		var this_ = this;
		this.preloader();
		this.container.css({
			'position': 'relative',
			'overflow': 'hidden'
		});

		this.scroll.css({
			position: 'absolute',
			left: 0,
			top: 0,
			'z-index': 5,
			'-webkit-user-select': 'none',
			'-khtml-user-select': 'none',
			'-moz-user-select': 'none',
			'-ms-user-select': 'none',
			'user-select': 'none'
		});

		this.loader.css({
			position: 'absolute',
			backgroundColor: '#fff',
			opacity: 0.5,
			width: '100%',
			height: '100%',
			zIndex: 9,
			textAlign: 'center',
			paddingTop: '50%',
			fontSize: '5em',
			cursor: 'default',
			'-webkit-user-select': 'none',
			'-khtml-user-select': 'none',
			'-moz-user-select': 'none',
			'-ms-user-select': 'none',
			'user-select': 'none'
		});

		// Add controls
		this.add_controls();

		this.zoom = 1;
		this.container.on('mousewheel DOMMouseScroll', function(e) {
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

			var scale_style = {
               '-webkit-transform': 'scale('+this_.zoom+')',
               '-moz-transform': 'scale('+this_.zoom+')',
               '-ms-transform': 'scale('+this_.zoom+')',
               '-o-transform': 'scale('+this_.zoom+')',
               'transform': 'scale('+this_.zoom+')'
           }

			this_.scroll.find('img').css(scale_style);

			return false;
		});


		var is_move = false;
		var first_step = false;
		this.container.on('mousedown touchstart', function() {
			first_step = true;
			is_move = true;
		});

		this.container.on('dragstart', function() {
			return false;
		});

		$(document).on('mouseup touchend', function() {
			is_move = false;
		});

		this.container.on('touchstart', function(e) {
			e.preventDefault();
		});

		var prev_x = 0;
		this.position = this.options.start;
		$(document).on('mousemove touchmove', function(e) {
			// Fix mouseup bug
			// TODO check on touches
			if (e.which === 0 && e.type === 'mousemove') {
				is_move = false;
			}

			var pos = this_.position;
			var speed = 0;
			if (is_move) {

				if (this_.is_rotate) {
					this_.auto_rotate.call(this_);
				}

				var x = pos;
				if (e.clientX) {
					x = e.clientX;
				} else if (e.originalEvent.targetTouches) {
					x = e.originalEvent.targetTouches[0].clientX;
					e.preventDefault();
				}

				// If first_step - no acceleration
				if (first_step === false) {
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
				}

				if (pos < 0) {
					pos = this_.options.count - 1;
				} else if (pos >= this_.options.count) {
					pos = 0;
				}

				this_.rotate_to(pos);

				prev_x = x;
				first_step = false;
			}
		});
	}


	Rotator.prototype.rotate_to = function( position ) {
		if (this.options.rotate !== false) {
			if (position < 0) {
				position = this.options.count - 1;
			} else if (position >= this.options.count) {
				position = 0;
			}

			this.position = position;

			var width = 0;
			if (this.options.width) {
				width = this.options.width;
			} else {
				width = this.first.width();
			}

			var left = position * width;
			left = 0 - left;

			this.current = position;
			this.scroll.css('left', left+'px');
		}
	}
	
	// Preload images
	Rotator.prototype.preloader = function() {
		var this_ = this;

		var css_obj = {};
		css_obj.float = 'left';
		if (this.options.width) {
			css_obj.width = this.options.width;
		}
		if (this.options.height) {
			css_obj.height = this.options.height;
		}

		// Prepare filenames
		var filenames = [];
		if (this.list_images === undefined) {
			for (var i = 0; i < this.options.count; i++) {
				var zi = i;
				if (this.options.add_zeros && i < 10) {
					zi = '0' + i;
				}
				var src = this.options.prefix + zi + this.options.postfix;
				filenames.push(src);
			}
		} else {
			$.each(this.list_images, function() {
				var src = $(this).attr('src');
				filenames.push(src);
			});
		}

		if (filenames.length > 0) {
			$.each(filenames, function(key, value) {
				var img_container = $('<div>', {
					class: 'rm-rotator_list_images'
				});

				img_container.css({
					overflow: 'hidden',
					float: 'left'
				});

				var img = $('<img>', {
					src: value
				});

				img.on('load', function() {
					this_.loaded++;
					this_.progress();
				});

				// Get first image
				if (key === 0) {
					this_.first = img;
					this_.first.on('load', function() {
						this_.set_sizes();
					});
				}

				img.appendTo(img_container);
				this_.scroll.append(img_container);
			});
		}
	}

	Rotator.prototype.progress = function() {
		if (this.loaded === this.options.count) {
			this.loader.remove();
			this.options.rotate = true;
			this.rotate_to(this.options.start);

			if (this.options.auto_rotate) {
				this.auto_rotate.call(this);
			}

			// Set sizes
			this.set_sizes();
		} else {
			if (this.options.progress) {
				var percent = this.loaded / this.options.count * 100;
				percent = Math.round(percent);
				this.loader.text(percent + '%');
			}
		}
	}


	// Set image and block sizes
	Rotator.prototype.set_sizes = function() {
		var this_ = this;
		if (this.options.width) {
			images_width = this.options.count * this.options.width;
			this.container.css('width', this.options.width);
			this.scroll.css('width', images_width);
			this.scroll.find('img').css('width', this.options.width);

			if (!this.options.height) {
				height = this.first.height();
				this.container.css('height', height);
			}
		}

		if (this.options.height) {
			this.container.css('height', this.options.height);
			this.scroll.css('height', this.options.height);
			this.scroll.find('img').css('height', this.options.height);

			if (!this.options.width) {
				width = this.first.width();
				this.container.css('width', width);
				this.scroll.css('width', width * this.options.count);
			}
		}

		// Auto set size to block after load first image
		if (!this.options.width && !this.options.height) {
			var width = this_.first.width();
			var height = this_.first.height();
			var images_width = this_.first.width() * this_.options.count;

			this_.container.css({
				width: width,
				height: height
			});

			this_.scroll.css({
				width: images_width,
				height: height
			});
		}
	}

	Rotator.prototype.add_controls = function() {
		var this_ = this;
		if (this.options && this.options.controls) {
			for (var i = 0; i < this.options.controls.length; i++) {
				if (this.options.controls[i] === 'autorotate') {
					var autorotate_control = $('<img>', {
														src: 'images/autorotate.png'
					});

					autorotate_control.css({
						position: 'absolute',
						bottom: '10px',
						left: '50%',
						zIndex: 7
					});

					$(autorotate_control).appendTo(this.container);

					autorotate_control.on('click', function() {
						this_.auto_rotate.call(this_);
					});
				}
			}
		}
	}

	Rotator.prototype.auto_rotate = function() {
		var this_ = this;
		var delay = this.options.rotate_delay - 0;
		if (!this.is_rotate) {
			this.is_rotate = setInterval(function() {
				var position = this_.position;
				position++;
				this_.rotate_to(position);
			}, delay);
		} else {
			clearInterval(this.is_rotate);
			this.is_rotate = false;
		}
	}
	
	$.fn.Rotator = function(options) {
		return new Rotator( $(this.selector), options );
	}


})(jQuery, window, document);