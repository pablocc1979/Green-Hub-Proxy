/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/


var Utils = {};

Utils.OS = {
	isMac: (/mac/i).test(navigator.userAgent),
	isWindows: (/win/i).test(navigator.userAgent),
	isLinux: (/linux/i).test(navigator.userAgent)
};

Utils.compareStrings = function compareStrings(s1, s2, reverseSorting) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();
	var length = Math.min(s1.length, s2.length);
	for (var i = 0; i < length; i++) {
		var ch1 = s1.charCodeAt(i);
		var ch2 = s2.charCodeAt(i);
		if (ch1 != ch2)
			return (reverseSorting ? (ch2 - ch1) : (ch1 - ch2));
	}
	
	return (reverseSorting ? (s2.length - s1.length) : (s1.length - s2.length));
};

Utils.compareNamedObjects = function compareNamedObjects(o1, o2) {
	return Utils.compareStrings(o1.name, o2.name);
};

Utils.createComparer = function createComparer(callbackGetObjectValue, reverseSorting) {
	return function (o1, o2) {
		return Utils.compareStrings(callbackGetObjectValue(o1), callbackGetObjectValue(o2), reverseSorting);
	};
};
