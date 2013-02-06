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
	}


	function Rotator( element, options ) {
		if (options.count === undefined || options.start === undefined || options.prefix === undefined || options.postfix === undefined) {
			return false;
		}

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
						'position': 'relative'
					});
		this.img.css({
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'z-index': 5
					});

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

		this.img.attr('src', this.options.prefix + this.options.start + this.options.postfix)


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
		var pos = this.options.start;
		$(document).on('mousemove', function(e) {

			if (e.which == 0) {
				is_move = false;
			}

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

				var zpos = pos;
				if (this_.options.add_zeros) {
					if (pos < 10) {
						zpos = "0" + pos;
					}
				}

				this_.img.attr('src', this_.options.prefix + zpos + this_.options.postfix);

				prev_x = x;
			}
		});
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
			// this.set_sizes();
			// TODO Hide loader
		});

	}

	Rotator.prototype.set_sizes = function() {

	}
	
	$.fn.Rotator = function(options) {
		return new Rotator( $(this.selector), options );
	}


})(jQuery, window, document);