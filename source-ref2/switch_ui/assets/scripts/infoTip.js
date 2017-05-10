/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var InfoTip = {};

///// Message Types //////
InfoTip.types = {
	note: "note",
	info: "info",
	success: "success",
	warning: "warning",
	error: "error"
};

InfoTip._timer = undefined;

InfoTip.showMessage = function showMessage(message, type, timeout) {
	if (timeout == undefined)
		timeout = 2500;
	
	if (InfoTip._timer) {
		clearTimeout(InfoTip._timer);
		InfoTip._timer = undefined;
	}	
	$("#infoTipContainer").remove();
	
	var note = $("<div id='infoTipContainer'><div>" +
					"<span class='close'></span>" +
					"<span class='text'>Info Tip</span>" +
				 "</div></div>");
	
	note.attr("class", type);
	$(".text", note).html(message);
	$(document.body).append(note);

	if (type == InfoTip.types.note) {
		$(".close", note).show().click(function() {
			note.animate({ top: -note.height() - 10 }, "fast");
		});
	}

	note.animate({ top: -1 }, "fast");
	
	if (timeout > 0) {
		InfoTip._timer = setTimeout(function() {
			note.animate({ top: -note.height() - 10 }, "normal");
			InfoTip._timer = undefined;
		}, timeout, undefined);
	}
};

InfoTip.showMessageI18n = function showMessageI18n(messageId, type, timeout) {
	var message = I18n.getMessage(messageId);
	return InfoTip.showMessage(message, type, timeout);
};

InfoTip.confirm = function confirm(message) {
	return window.confirm("\n" + message);
};

InfoTip.confirmI18n = function confirmI18n(messageId, substitution) {
	var message = I18n.getMessage(messageId, substitution);
	return InfoTip.confirm(message);
};

InfoTip.alert = function alert(message) {
	return window.alert("\n" + message);
};

InfoTip.alertI18n = function alertI18n(messageId, substitution) {
	var message = I18n.getMessage(messageId, substitution);
	return InfoTip.alert(message);
};
