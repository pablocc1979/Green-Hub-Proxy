/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var HelpToolTip = {};

HelpToolTip.tipElement = undefined;

HelpToolTip.onMouseOver = function onMouseOver(event) {
	HelpToolTip.hide();
	HelpToolTip.buildTip(event);	
	setTimeout(HelpToolTip.show, 600);	
};

HelpToolTip.onMouseOut = function onMouseOut(event) {
	HelpToolTip.hide();
};

HelpToolTip.show = function show() {
	if (HelpToolTip.tipElement)
		HelpToolTip.tipElement.style.visibility = 'visible';
};

HelpToolTip.hide = function hide() {
	if (HelpToolTip.tipElement) { 
		HelpToolTip.tipElement.parentNode.removeChild(HelpToolTip.tipElement);
		HelpToolTip.tipElement = undefined;
	}
};

HelpToolTip.buildTip = function buildTip(mouseEvent) {
	var element = document.createElement('div');
	element.id = 'helpTooltip';
	element.innerHTML = mouseEvent.toElement.innerHTML;
	element.style.top = 0;
	element.style.left = 0;
	element.style.visibility = 'hidden';
	document.body.appendChild(element);

	var width = element.offsetWidth;
	var height = element.offsetHeight;

	if (mouseEvent.pageX - width - 50 + document.body.scrollLeft >= 0)
		element.style.left = (mouseEvent.pageX - width - 5) + 'px';
	else
		element.style.left = (mouseEvent.pageX + 15) + 'px';
	
	if (mouseEvent.pageY - height - 50 + document.body.scrollTop >= 0)
		element.style.top = (mouseEvent.pageY - height - 5) + 'px';
	else
		element.style.top = (mouseEvent.pageY + 15) + 'px';

	HelpToolTip.tipElement = element;
};

HelpToolTip.enableTooltips = function enableTooltips() {
	var helpElements = document.getElementsByClassName('help');

	for (var i = 0, helpElement; helpElement = helpElements[i]; i++) {
		helpElement.onmouseover = HelpToolTip.onMouseOver;
		helpElement.onmouseout = HelpToolTip.onMouseOut;
		helpElement.onclick = HelpToolTip.show;
	}
};
