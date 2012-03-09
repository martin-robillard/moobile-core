/*
---

name: ActivityIndicator

description:

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Control

provides:
	- ActivityIndicator

...
*/

/**
 * @see    http://moobile.net/api/0.1/Control/ActivityIndicator
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1
 */
Moobile.ActivityIndicator = new Class({

	Extends: Moobile.Control,

	/**
	 * @overrides
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willBuild: function() {
		this.parent();
		this.element.addClass('activity-indicator');
	},

	/**
	 * @see    http://moobile.net/api/0.1/Control/ActivityIndicator#start
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	start: function() {
		return this.addClass('activity');
	},

	/**
	 * @see    http://moobile.net/api/0.1/Control/ActivityIndicator#stop
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	stop: function() {
		return this.removeClass('activity');
	}

});

//------------------------------------------------------------------------------
// Roles
//------------------------------------------------------------------------------

Moobile.Component.defineRole('activity-indicator', null, function(element) {
	this.addChild(Moobile.Component.create(Moobile.ActivityIndicator, element, 'data-activity-indicator'));
});
