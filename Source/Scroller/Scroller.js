/*
---

name: Scroller

description: Provides a wrapper for the iScroll scroller.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Core/Class
	- Core/Class.Extras
	- Class.Mutator.Property

provides:
	- Scroller

...
*/

/**
 * @name  Scroller
 * @class Provides the class that wraps a scroller engine.
 *
 * @classdesc
 *
 * [TODO: Introduction]
 * [TODO: Events]
 * [TODO: Options]
 *
 * @author  Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @version 0.1
 */
Moobile.Scroller = new Class( /** @lends Scroller.prototype */ {

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	/**
	 * @var    {Scroller.Engine} The engine.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	engine: null,

	/**
	 * @var    {Element} The content element, with variable size.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	content: null,

	/**
	 * @var    {Element} The content wrapper element, with fixed size.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	wrapper: null,

	/**
	 * @var    {Object} The scrolling position at the beginning of a scroll.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	startScroll: null,

	/**
	 * @var    {Object} The scrolling time at the beginning of a scroll.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	startTime: null,

	/**
	 * @var    {Object} The scrolling page at the beginning of a scroll.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	startPage: null,

	/**
	 * @var    {Object} The class options.
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	options: {
		engine: ['Native', 'IScroll'],
		momentum: true,
		scrollX: true,
		scrollY: true,
		snapToPage: false,
		snapToPageAt: 35,
		snapToPageDuration: 150,
		snapToPageDelay: 150
	},

	/**
	 * Initializes this scroller.
	 *
	 * This `content` element given to this method will be wrapped with an
	 * other element. Any CSS classes given to the `content` element will be
	 * added to the wrapper element with the `-wrapper` suffix.
	 *
	 * This method also creates a scroller engine that is proper for the
	 * current platform based on the `engine` option.
	 *
	 * @param {Element}	[content] The Element, element id or string.
	 * @param {Object}  [options] The options.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	initialize: function(content, options) {

		this.setOptions(options);

		if (this.options.snapToPage)
			this.options.momentum = false;

		var engine = null;

		Array.from(this.options.engine).each(function(name) {

			engine = Moobile.Scroller.Engine[name];
			if (engine == undefined) {
				throw new Error('The scroller engine ' + engine + ' does not exists');
			}

			if (engine.supportsCurrentPlatform &&
				engine.supportsCurrentPlatform.call(this) == false) {
				engine = null;
				return;
			}

		}, this);

		if (engine == null) {
			throw new Error('There are no scrolling engine available');
		}

		var options = {
			momentum: this.options.momentum,
			scrollX: this.options.scrollX,
			scrollY: this.options.scrollY
		};

		this.engine = new engine(content, options);
		this.engine.addEvent('start', this.bound('onStart'));
		this.engine.addEvent('move', this.bound('onMove'));
		this.engine.addEvent('end', this.bound('onEnd'));

		this.wrapper = this.getWrapper();
		this.content = this.getContent();

		var classes = this.content.get('class');
		if (classes) {
			classes.split(' ').each(function(klass) {
				this.wrapper.addClass(klass + '-wrapper');
			}, this);
		}

		this.wrapper.addClass('scroll');

		return this;
	},

	/**
	 * Destroys this scroller.
	 *
	 * This method will destroy the scroller engine. The scrollable content
	 * will not be removed upon destruction as the content wrapper will.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	destroy: function() {

		this.engine.destroy();
		this.engine = null;

		return this;
	},

	/**
	 * Scrolls to a set of coordinates.
	 *
	 * @param {Number} x      The x coordinate.
	 * @param {Number} y      The y coordinate.
	 * @param {Number} [time] The duration of the scroll.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	scrollTo: function(x, y, time) {
		this.engine.scrollTo(x, y, time);
		return this;
	},

	/**
	 * Scrolls to page.
	 *
	 * @param {Number} pageX  The horizontal page number.
	 * @param {Number} pageY  The vertical page number.
	 * @param {Number} [time] The duration of the scroll.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	scrollToPage: function(pageX, pageY, time) {

		pageX = pageX || 0;
		pageY = pageY || 0;

		var size = this.getSize();
		var x = size.x * pageX;
		var y = size.y * pageY;

		this.scrollTo(x, y, time);

		return this;
	},

	/**
	 * Scrolls to an element.
	 *
	 * @param {Element} element The element to scroll to.
	 * @param {Number}  [time]  The duration of the scroll.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	scrollToElement: function(element, time) {
		this.engine.scrollToElement(element, time);
		return this;
	},

	/**
	 * Snaps to the proper page.
	 *
	 * This method will snap to the closest page based on the scroller options.
	 * You should seldom need to call this method as it's called automatically
	 * when the `snapToPage` option is enabled.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	snap: function() {

		var size = this.getSize();
		var scroll = this.getScroll();

		var time = Date.now() - this.startTime;

		var pageX = this.startPage.x;
		var pageY = this.startPage.y;
		var moveX = Math.round((scroll.x - this.startPage.x * size.x) / size.x * 100);
		var moveY = Math.round((scroll.y - this.startPage.y * size.y) / size.y * 100);

		var dirX = moveX >= 0 ? 1 : -1;
		var dirY = moveY >= 0 ? 1 : -1;

		if (Math.abs(this.startScroll.x - scroll.x) < 10) dirX = 0;
		if (Math.abs(this.startScroll.y - scroll.y) < 10) dirY = 0;

		if (Math.abs(moveX) >= this.options.snapToPageAt || time <= this.options.snapToPageDelay) pageX += dirX;
		if (Math.abs(moveY) >= this.options.snapToPageAt || time <= this.options.snapToPageDelay) pageY += dirY;

		this.scrollToPage(pageX, pageY, this.options.snapToPageDuration);

		return this;
	},

	/**
	 * Refreshes this scroller.
	 *
	 * What this method exacly does is based on this scroller engine
	 * implementation of the `refresh` method.
	 *
	 * @return {Scroller} This scroller.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	refresh: function() {
		this.engine.refresh();
		return this;
	},

	/**
	 * Returns the size.
	 *
	 * This method will return the wrapper's size as an object with two keys,
	 * `x` which indicates the width and `y` which indicates the height.
	 *
	 * @return {Object} The size.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getSize: function() {
		return this.engine.getSize();
	},

	/**
	 * Returns the current scroll position.
	 *
	 * This method will return the current scroll position as an object
	 * with two keys, `x` which indicates the horizontal scroll and `y` which
	 * indicates the vertical scroll of this entity.
	 *
	 * @return {Object} The scroll position.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getScroll: function() {
		return this.engine.getScroll();
	},

	/**
	 * Returns size including the scrolling area.
	 *
	 * This method will return the content's size as an object with two keys,
	 * `x` which indicates the width and `y` which indicates the height.
	 *
	 * @return {Object} The size including the scrolling area.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getScrollSize: function() {
		return this.engine.getScrollSize();
	},

	/**
	 * Returns the current page.
	 *
	 * This method will return the current page as an object with two keys,
	 * `x` which indicates horizontal page and `y` which indicates the vertical
	 * page.
	 *
	 * @return {Object} This scroller's current page.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getPage: function() {
		return {
			x: Math.floor(this.getScroll().x / this.getSize().x),
			y: Math.floor(this.getScroll().y / this.getSize().y)
		};
	},

	/**
	 * Returns the content element.
	 *
	 * @return {Element} The content element.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getContent: function() {
		return this.engine.getContent();
	},

	/**
	 * Returns the wrapper element.
	 *
	 * @return {Element} The wrapper element.
	 *
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getWrapper: function() {
		return this.engine.getWrapper();
	},

	onStart: function() {
		this.startScroll = this.getScroll();
		this.startPage = this.getPage();
		this.startTime = Date.now();
		this.fireEvent('start');
	},

	onMove: function() {
		this.fireEvent('move');
	},

	onEnd: function() {

		if (this.options.snapToPage)
			this.snap();

		this.startScroll = null;
		this.startPage = null;
		this.startTime = null;

		this.fireEvent('end');
	}
});

(function() {

window.addEvent('domready', function(e) {

	var pos = null;

	document.addEvent('touchstart', function(e) {
		pos = e.client;
	});

	document.addEvent('touchmove', function(e) {

		if (e.target.getParent('.scroll') == null) {
			e.preventDefault();
		} else {

			//
			// TODO
			// This part has to be improved, right now only a pure horizontal
			// move will allow the whole thing to move
			//

			//if (Math.abs(e.client.y - pos.y) > Math.abs(e.client.x - pos.x))
			//	e.preventDefault();
		}
	});
});

})();
