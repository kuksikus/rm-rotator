;(function(
			$,
			window,
			document,
			undefined
		) {

	var defaults = {
		
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
		this.container.css({'position': 'relative'});
		this.img.css({
						'position': 'absolute',
						'left': 0,
						'top': 0,
						'z-index': 5
					});

	}

	
	$.fn.Rotator = function(options) {
		return new Rotator( $(this.selector), options );
	}


})(jQuery, window, document);