;(function(
			$,
			window,
			document,
			undefined
		) {


	var defaults = {
		// add_zeros: 'false'				
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
		this.preloader();

		this.container.css({'position': 'relative'});
		this.img.css({
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'z-index': 5
					});

	}
	
	// Preload images
	Rotator.prototype.preloader = function() {
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

	} 
	
	$.fn.Rotator = function(options) {
		return new Rotator( $(this.selector), options );
	}


})(jQuery, window, document);