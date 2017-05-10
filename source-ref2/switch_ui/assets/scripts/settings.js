/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var Settings = {};

Settings.configCache = {};

Settings.init = function init() {
	Settings.configCache = {};
	if (localStorage.config) {
		try {
			Settings.configCache = JSON.parse(localStorage.config);
		} catch (ex) {
			Logger.log("Error @Settings.init() > " + ex.toString(), Logger.Types.error);
		}
	}
};

Settings.commit = function commit() {
	localStorage.config = JSON.stringify(Settings.configCache);
};

Settings.setValue = function setValue(key, value) {
	Settings.configCache[key] = value;
	Settings.commit();
};

Settings.getValue = function getValue(key, defaultValue) {
	if (!Settings.keyExists(key))
		return defaultValue;

	return Settings.configCache[key];
};

Settings.keyExists = function keyExists(key) {
	return (key in Settings.configCache);
};

Settings.setObject = function setObject(key, object) {
	localStorage[key] = JSON.stringify(object);
};

Settings.getObject = function getObject(key) {
	if (key in localStorage)
		return undefined;

	try {
		return JSON.parse(localStorage[key]);
	} catch (ex) {
		Logger.log("Error @Settings.getObject() > " + ex.toString(), Logger.Types.error);
		return undefined;
	}
};

Settings.init();
