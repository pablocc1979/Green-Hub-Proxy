/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var I18n = {};

I18n.messages = null;

I18n.init = function init() {
	I18n.messages = I18n.readMessages();
//	I18n.readMessages(function(messages) {
//		I18n.messages = messages;
//	});
};

I18n.buildMessages = function buildMessages() {
	var result = "\n";
	
	$("*[i18n-content]").each(function(i, item) {
		result += '"' + item.getAttribute("i18n-content") + '"' +
				  ': { "message": "' + item.innerHTML.replace(/[ \r\n\t]+/g, " ") + '" },\n';
	});
	
	$("*[i18n-values]").each(function(i, item) {
		$(item.getAttribute("i18n-values").split(";")).each(function(i, subItem) {
			var subItemParts = subItem.split(":");
			if (subItemParts.length == 2 && subItemParts[0].charAt(0) != ".") {	
				result += '"' + subItemParts[1] + '"' +
						  ': { "message": "' + item.getAttribute(subItemParts[0]).replace(/[\r\n]/g, "\\n") + '" },\n';
			}
		});
	});
	
	return result;
};

I18n.readMessages = function readMessages(callback) {
	var async = (callback != undefined);
	var data = null;
	var request = new XMLHttpRequest();
	request.open("GET", chrome.extension.getURL("_locales/en/messages.json"), async);
	request.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			data = this.responseText;
			data = JSON.parse(data.replace(/[\r\n\t]+/g, " "));
			if (async)
				callback(data);
		}
	};
	request.send();
	
	return data;
};

I18n.getMessage = function getMessage(messageName, substitution) {
	var result = chrome.i18n.getMessage(messageName, substitution);
	if (result == undefined || result.length == 0) {
		var messageObject = I18n.messages[messageName];
		if (messageObject != undefined) {
			result = messageObject.message;
			if (result != undefined)
				result = result.replace("$1", substitution);
		}
	}
	return result;
};

I18n.process = function process(node) {
	return I18nTemplate.process(node);
};

I18n.init();

//-------------------------------------------------------

/**
 * i18nTemplate: http://src.chromium.org/viewvc/chrome/trunk/src/chrome/browser/resources/i18n_template.js
 */
var I18nTemplate = (function() {
	var handlers = {
		/**
		 * This handler sets the textContent of the element.
		 */
		'i18n-content' : function(element, attributeValue) {
			element.innerHTML/*textContent*/ = I18n.getMessage(attributeValue);
		},

		/**
		 * This is used to set HTML attributes and DOM properties,. The syntax
		 * is: attributename:key; .domProperty:key; .nested.dom.property:key
		 */
		'i18n-values' : function(element, attributeValue) {
			var parts = attributeValue.replace(/\s/g, '').split(/;/);
			for (var j = 0; j < parts.length; j++) {
				var a = parts[j].match(/^([^:]+):(.+)$/);
				if (a) {
					var propName = a[1];
					var propExpr = a[2];

					var value = I18n.getMessage(propExpr);
					if (propName.charAt(0) == '.') {
						var path = propName.slice(1).split('.');
						var object = element;
						while (object && path.length > 1) {
							object = object[path.shift()];
						}
						if (object) {
							object[path] = value;
							// In case we set innerHTML (ignoring others) we need to
							// recursively check the content
							if (path == 'innerHTML') {
								process(element);
							}
						}
					} else {
						element.setAttribute(propName, value);
					}
				}
			}
		}
	};

	var attributeNames = [];
	for (var key in handlers) {
		attributeNames.push(key);
	}
	var selector = '[' + attributeNames.join('],[') + ']';

	function process(node) {
		var elements = node.querySelectorAll(selector);
		for (var element, i = 0; element = elements[i]; i++) {
			for (var j = 0; j < attributeNames.length; j++) {
				var name = attributeNames[j];
				var att = element.getAttribute(name);
				if (att != null) {
					handlers[name](element, att);
				}
			}
		}
	}

	return {
		process : process
	};
})();
