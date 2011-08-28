/*!
 *
 * FlexJS v0.1
 * http://www.playwell.co.jp/flexjs/
 *
 * Copyright 2011, Playwell Inc.
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */
(function($) {

var win = $(window);
var uiClasses = 'ui-group ui-hgroup ui-vgroup ui-button ui-label ui-text ui-spacer'.split(' ');
var scrollerWidth = 18;

// 
$.fn.getMeasuredWidth = function() {
	if (this.length == 0) return 0;
	if (this.hasClass('ui-hgroup')) {
		var totalWidth = 0;
		this.children().each(function() {
			var ww = $(this).getMeasuredWidth();
			totalWidth += ww;
		});
		return totalWidth + this.getExtraWidth();
	} else if (this.hasClass('ui-vgroup')) {
		var maxWidth = 0;
		this.children().each(function() {
			var ww = $(this).getMeasuredWidth();
			if (maxWidth < ww) maxWidth = ww;
		});
		return maxWidth + this.getExtraWidth();
	} else {
		return this.uiwidth();
	}
};
$.fn.getMeasuredHeight = function() {
	if (this.length == 0) return 0;
	if (this.hasClass('ui-hgroup') || this.hasClass('ui-group')) {
		var maxHeight = 0;
		this.children().each(function() {
			var hh = $(this).getMeasuredHeight();
			if (maxHeight < hh) maxHeight = hh;
		});
		return maxHeight + this.getExtraHeight();
	} else if (this.hasClass('ui-vgroup')) {
		var totalHeight = 0;
		this.children().each(function() {
			var hh = $(this).getMeasuredHeight();
			totalHeight += hh;
		});
		return totalHeight + this.getExtraHeight();
	} else {
		return this.uiheight();
	}
};
$.fn.getExtraWidth = function() {
	var w = parseInt(this.css('border-left-width'), 10)
		+ parseInt(this.css('border-right-width'), 10)
		//+ parseInt(this.css('margin-left'), 10)
		//+ parseInt(this.css('margin-right'), 10)
		+ parseInt(this.css('padding-left'), 10)
		+ parseInt(this.css('padding-right'), 10);
	return w;
};
$.fn.getExtraHeight = function() {
	var h = parseInt(this.css('border-top-width'), 10)
		+ parseInt(this.css('border-bottom-width'), 10)
		//+ parseInt(this.css('margin-top'), 10)
		//+ parseInt(this.css('margin-bottom'), 10)
		+ parseInt(this.css('padding-top'), 10)
		+ parseInt(this.css('padding-bottom'), 10);
	return h;
};
$.fn.uiwidth = function() {
	if (arguments.length >= 1) {
		var w = arguments[0];
		return this.each(function() {
			var child = $(this);
			child.width(w - child.getExtraWidth());
		});
	}
	return this.outerWidth();
};
$.fn.uiheight = function() {
	if (arguments.length >= 1) {
		var h = arguments[0];
		return this.each(function() {
			var child = $(this);
			child.height(h - child.getExtraHeight());
		});
	}
	return this.outerHeight();
};
$.fn.flexui = function() {
	return this.each(function() {
		var obj = $(this);
		var initialized = $.data(this, 'ui-initialized');
		if (initialized) return;
		obj.flexLayout();
		$(window).resize(function() {
			obj.flexLayout();
		});
		$.data(this, 'ui-initialized', true);
	});
};
$.fn.flexLayout = function() {
	return this.each(function() {
		var self = this;
		doUILayout(this);
		setTimeout(function() {
			doUILayout(self);
		}, 1);
	});
	return this;
};
function doUILayout(obj) {
	obj = $(obj);
	
	var n = uiClasses.length;
	var isComponent = false;
	for (var i = 0; i < n; i++) {
		var className = uiClasses[i];
		if (obj.hasClass(className)) {
			isComponent = true;
			break;
		}
	}
	if (!isComponent) return;
	
	var isFooter = obj.get(0).tagName.toLowerCase() == 'footer';
	
	// INIT
	var components = [];
	obj.children().each(function() {
		var child = $(this);
		var n = uiClasses.length;
		var isComponent = false;
		for (var i = 0; i < n; i++) {
			var className = uiClasses[i];
			if (child.hasClass(className)) {
				isComponent = true;
				components.push(child);
				
				if (className == 'ui-button') {
					if (child.find('span').length == 0) {
						var label = child.html();
						child.empty();
						child.append($('<span />').html(label));
					}
				}
				
				break;
			}
		}
	});
	
	// MEASURE
	var w = obj.width();
	var h = obj.height();
	
	var childExplicitWidth = 0;
	var childExplicitHeight = 0;
	var childPercentWidthTotal = 0;
	var childPercentHeightTotal = 0;
	$.each(components, function() {
		var child = $(this);
		var cw = child.attr('data-width');
		if (cw == '' || cw == null) {
			if (child.hasClass('ui-vgroup')) {
				var maxWidth = 0;
				child.children().each(function() {
					maxWidth = Math.max(maxWidth, $(this).getMeasuredWidth());
				});
				var measuredWidth = maxWidth + child.getExtraWidth();
				child.attr('data-measured-width', measuredWidth);
				childExplicitWidth += measuredWidth;
			} else if (child.hasClass('ui-hgroup')) {
				var totalWidth = 0;
				child.children().each(function() {
					totalWidth += $(this).getMeasuredWidth();
				});
				var measuredWidth = totalWidth + child.getExtraWidth();
				child.attr('data-measured-width', measuredWidth);
				childExplicitWidth += measuredWidth;
			} else {
				childExplicitWidth += child.outerWidth();
			}
		} else if (cw.match(/%$/)) {
			cw = parseInt(cw, 10);
			childPercentWidthTotal += cw;
		} else {
			childExplicitWidth += parseInt(cw, 10);
		}
	
		var ch = child.attr('data-height');
		if (ch == '' || ch == null) {
			if (child.hasClass('ui-vgroup')) {
				var totalHeight = 0;
				child.children().each(function() {
					totalHeight += $(this).getMeasuredHeight();
				});
				var measuredHeight = totalHeight + child.getExtraHeight();
				child.attr('data-measured-height', measuredHeight);
				childExplicitHeight += measuredHeight;
			} else if (child.hasClass('ui-hgroup')) {
				var maxHeight = 0;
				child.children().each(function() {
					maxHeight = Math.max(maxHeight, $(this).getMeasuredHeight());
				});
				var measuredHeight = maxHeight + child.getExtraHeight();
				child.attr('data-measured-height', measuredHeight);
				childExplicitHeight += measuredHeight;
			} else {
				childExplicitHeight += child.outerHeight();
			}
		} else if (ch.match(/%$/)) {
			ch = parseInt(ch, 10);
			childPercentHeightTotal += ch;
		} else {
			childExplicitHeight += parseInt(ch, 10);
		}
	});
	if (obj.hasClass('ui-group')) {
		if (obj.getMeasuredHeight() > obj.height()) {
			w -= scrollerWidth;
		}
		if (obj.getMeasuredWidth() > obj.width()) {
			h -= scrollerWidth;
		}
	}
	
	// UPDATE DISPLAY LIST
	var x = parseInt(obj.css('padding-left'), 10);
	var y = parseInt(obj.css('padding-top'), 10);
	
	$.each(components, function() {
		var child = this;
		var cw = child.attr('data-width') || child.attr('data-measured-width') || '';
		var ch = child.attr('data-height') || child.attr('data-measured-height') || '';
		if (cw.match(/%$/)) {
			cw = parseInt(cw, 10);
			if (!obj.hasClass('ui-hgroup')) {
				child.uiwidth(w * cw / 100);
			} else {
				cw = (w - childExplicitWidth) * (cw / Math.max(100, childPercentWidthTotal));
				child.uiwidth(cw);
			}
		} else if (cw != '') {
			child.uiwidth(parseInt(cw, 10));
		}
		
		if (ch.match(/%$/)) {
			ch = parseInt(ch, 10);
			if (!obj.hasClass('ui-vgroup')) {
				child.uiheight(h * ch / 100);
			} else {
				ch = (h - childExplicitHeight) * (ch / Math.max(100, childPercentHeightTotal));
				child.uiheight(ch);
			}
		} else if (ch != '') {
			child.uiheight(parseInt(ch, 10));
		}
		
		child.css({
			'top': y + 'px',
			'left': x + 'px'
		});
		
		if (obj.hasClass('ui-hgroup')) {
			var valign = obj.attr('data-vertical-align');
			valign = (valign == 'bottom') ? 1 : (valign == 'middle') ? 0.5 : 0;
			child.css('top', (y + (h - child.uiheight()) * valign) + 'px');
			x += child.outerWidth();
		} else if (obj.hasClass('ui-vgroup')) {
			var halign = obj.attr('data-horizontal-align');
			halign = (halign == 'right') ? 1 : (halign == 'center') ? 0.5 : 0;
			child.css('left', (x + (w - child.uiwidth()) * halign) + 'px');
			y += child.outerHeight();
		} else if (obj.hasClass('ui-group')) {
			var left = obj.attr('data-left') || '';
			if (left.match(/\d/)) child.css('left', (x + parseInt(left, 10)) + 'px');
			var top = obj.attr('data-top') || '';
			if (top.match(/\d/)) child.css('top', (x + parseInt(top, 10)) + 'px');
		}
	});
	obj.children().each(function() {
		doUILayout(this);
	});
}

$(function () {

// get scroll bar size
var t1 = $('<div style="width: 100px; height: 100px; overflow: scroll;" />').appendTo('body');
var t2 = $('<div style="height: 100%;" />').appendTo(t1);
scrollerWidth = 100 - t2.width();
t1.remove();
t1 = t2 = null;
if (isNaN(scrollerWidth)) scrollerWidth = 18;
});


})(jQuery);
