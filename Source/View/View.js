/*
---

name: View

description: Provides an element on the screen and the interfaces for managing
             the content in that area.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Core

provides:
	- View

...
*/

Moobile.View = new Class({

	Extends: UI.Element,

	Binds: [
		'removeChildView',
		'attachChildControl',
		'removeChildControl',
		'attachChildElement',
		'removeChildElement'
	],

	window: null,

	parentView: null,

	scroller: null,

	movable: null,

	wrapper: null,

	childViews: [],

	childElements: [],

	childControls: [],

	options: {
		className: 'view',
		scroll: true,
		scrollRefresh: -1,
		wrap: true
	},

	initialize: function(element, options) {
		this.setElement(element);
		this.setOptions(options);
		if (this.options.scroll) this.scroll();
		if (this.options.wrap) this.wrap();
		this.attachChildElements();
		this.attachChildControls();
		return this.parent(element, options);
	},

	destroy: function() {
		this.destroyChildViews();
		this.destroyChildElements();
		this.destroyChildControls();
		if (this.wrapper) {
			this.wrapper.destroy();
			this.wrapper = null;
		}
		if (this.scroller) {
			this.scroller.destroy();
			this.scroller = null;
		}
		this.parent();
		return this;
	},

	attachEvents: function() {
		this.element.addEvent('orientationchange', this.onOrientationChange);
  		return this;
	},

	detachEvents: function() {
		this.element.removeEvent('orientationchange', this.onOrientationChange);
		return this;
	},

	destroyChildViews: function() {
		this.childViews.each(function(view) { view.destroy(); });
		this.childViews = null;
		this.childViews = [];
	},

	destroyChildElements: function() {
		this.childElements.each(function(element) { element.destroy(); });
		this.childElements = null;
		this.childElements = [];
	},

	destroyChildControls: function() {
		this.childControls.each(function(control) { control.destroy(); });
		this.childControls = null;
		this.childControls = [];
	},

	setWindow: function(window) {
		this.window = window;
		return this;
	},

	getWindow: function() {
		return this.window;
	},

	setParentView: function(parentView) {
		this.parentView = parentView;
		return this;
	},

	getParentView: function() {
		return this.parentView;
	},

	scroll: function() {
		this.wrapper = new Element('div.' + this.options.className + '-scroll-wrapper').set('html', this.element.get('html'));
		this.movable = new Element('div.' + this.options.className + '-scroll-element');
		this.movable.adopt(this.wrapper);
		this.element.empty();
		this.element.adopt(this.movable);
		this.enableScroller();
		if (document.preventScroll == undefined) {
			document.preventScroll = true;
			document.addEventListener('touchmove', function(e) {
				e.preventDefault();
			});
		}
		return this;
	},

	enableScroller: function() {
		if (this.scroller == null && this.movable) {
			this.scroller = new Moobile.Scroller(this.movable);
			this.scroller.refresh();
		}
		return this;
	},

	disableScroller: function() {
		if (this.scroller && this.movable) {
			this.scroller.destroy();
			this.scroller = null;
		}
		return this;
	},

	updateScroller: function() {
		if (this.scroller && this.movable) {
			this.scroller.refresh();
		}
		return this;
	},

	wrap: function() {
		var content = this.getContent();
		var element = new Element('div.' + this.options.className + '-wrapper').set('html', content.get('html'));
		content.empty();
		content.adopt(element);
		this.wrapper = element;
		return this;
	},

	addChildView: function(view) {
		this.childViews.push(view);
		view.setParentView(this);
		view.setWindow(this.window);
		this.adopt(view);
		return this;
	},

	removeChildViews: function() {
		this.childViews.each(this.removeChildView);
		this.childViews = null;
		this.childViews = [];
		return this;
	},

	removeChildView: function(view) {
		var removed = this.childViews.remove(view);
		if (removed) view.dispose();
		return this;
	},

	removeFromParentView: function() {
		var parent = this.parentView || this.window;
		if (parent) parent.removeChildView(this);
		return this;
	},

	attachChildControls: function() {
		this.element.getElements('[data-role=control]').each(this.attachChildControl);
		return this;
	},

	attachChildControl: function(element) {
		var control = Class.from(element.getProperty('data-control') || 'UI.Control', element);
		var name = element.getProperty('data-name');
		if (name) {
			control.name = name;
			control.member = control.name.camelize();
			if (this[control.member] == null || this[control.member] == undefined) {
				this[control.member] = control;
			}
		}
		this.childControls.push(control);
		return this;
	},

	detachChildControls: function() {
		this.childControls = null;
		this.childControls = [];
		return this;
	},

	detachChildControl: function(control) {
		this.childControls.remove(control);
		return this;
	},

	addChildControl: function(control) {
		this.attachChildControl(control);
		var content = this.getContent();
		content.adopt(control);
		return this;
	},

	getChildControl: function(name) {
		return this.childControls.find(function(control) { return control.name == name; });
	},

	removeChildControls: function() {
		this.childControls.each(this.removeChildElement);
		this.childControls = null;
		this.childControls = [];
		return this;
	},

	removeChildControl: function(control) {
		var removed = this.childControls.remove(control);
		if (removed) control.dispose();
		return this;
	},

	attachChildElements: function() {
		this.element.getElements('[data-role=element]').each(this.attachChildElement);
		return this;
	},

	attachChildElement: function(element) {
		this.childElements.push(element);
		return this;
	},

	detachChildElements: function() {
		this.childElements = null;
		this.childElements = [];
		return this;
	},

	detachChildElement: function(element) {
		this.childElements.remove(element);
		return this;
	},

	addChildElement: function(element) {
		this.attachChildElement(element);
		var content = this.getContent();
		content.adopt(element);
		return this;
	},

	getChildElement: function(name) {
		return this.childElements.find(function(element) { return element.getProperty('data-name') == name; });
	},

	removeChildElements: function() {
		this.childElements.each(this.removeChildElement);
		this.childElements = null;
		this.childElements = [];
		return this;
	},

	removeChildElement: function(element) {
		var removed = this.childElements.remove(element);
		if (removed) element.dispose();
		return this;
	},

	adopt: function() {
		var content = this.getContent();
		var where = arguments[arguments.lenght - 1];
		if (typeof where == 'string') {
			if (where == 'element') content = this.element;
			if (where == 'wrapper') content = this.wrapper;
			Array.prototype.pop.call(arguments);
		}
		content.adopt.apply(content, arguments);
		return this;
	},

	getContent: function() {
		return this.wrapper || this.element;
	}

});