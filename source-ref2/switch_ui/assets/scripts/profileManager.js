/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var ProfileManager = {};

ProfileManager.ProxyModes = {
	direct: "direct",
	manual: "manual",
	auto: "auto"
};

ProfileManager.profiles = {};

ProfileManager.directConnectionProfile = {
	id: "direct",
	name: "[" + I18n.getMessage("proxy_directConnection") + "]",
	proxyMode: ProfileManager.ProxyModes.direct,
	color: "inactive"
};

ProfileManager.currentProfileName = "<Current Profile>";

ProfileManager.init = function init() {
	ProfileManager.loadProfiles();
};

ProfileManager.loadProfiles = function loadProfiles() {
	var profiles = Settings.getObject("profiles");
	if (profiles != undefined) {
		for (var i in profiles) {
			var profile = profiles[i];
			profile = ProfileManager.fixProfile(profile);
		}

		ProfileManager.profiles = profiles;
	}
};

ProfileManager.save = function saveProfiles() {
	Settings.setObject("profiles", ProfileManager.profiles);
};

ProfileManager.getProfiles = function getProfiles() {
	var profiles = {};
	for (var i in ProfileManager.profiles) {
		var profile = ProfileManager.profiles[i];
		profile = ProfileManager.normalizeProfile(profile);
		profiles[i] = profile;
	}
	
	return profiles;
};

ProfileManager.setProfiles = function setProfiles(profiles) {
	profiles = $.extend(true, {}, profiles);
	ProfileManager.profiles = profiles;
};

ProfileManager.getSortedProfileArray = function getSortedProfileArray() {
	var profiles = ProfileManager.getProfiles();
	var profileArray = [];
	for (var i in profiles)
		profileArray[profileArray.length] = profiles[i];

	profileArray = profileArray.sort(Utils.compareNamedObjects);
	return profileArray;
};

ProfileManager.getSortedProfileIdArray = function getSortedProfileIdArray() {
	var profiles = ProfileManager.getSortedProfileArray();
	var profileArray = [];
	for (var i in profiles)
		profileArray[profileArray.length] = profiles[i].id;

	return profileArray;
};

ProfileManager.getProfile = function getProfile(profileId) {
	var profile;
	if (profileId == ProfileManager.directConnectionProfile.id)
		profile = ProfileManager.directConnectionProfile;
	else
		profile = ProfileManager.profiles[profileId];
	
	profile = ProfileManager.normalizeProfile(profile);
	return profile;
};

ProfileManager.getSelectedProfile = function getSelectedProfile() {
	var profile = Settings.getObject("selectedProfile");
	if (profile != undefined) {
		profile = ProfileManager.fixProfile(profile);
		profile = ProfileManager.normalizeProfile(profile);
	}
	
	return profile;
};

ProfileManager.getCurrentProfile = function getCurrentProfile() {
	var plugin = chrome.extension.getBackgroundPage().plugin;
	var proxyMode;
	var proxyString;
	var proxyExceptions;
	var proxyConfigUrl;
	try {
		proxyMode = plugin.proxyMode;
		proxyString = plugin.proxyServer;
		proxyExceptions = plugin.proxyExceptions;
		proxyConfigUrl = plugin.proxyConfigUrl;
	} catch(ex) {
		Logger.log("Plugin Error @ProfileManager.getCurrentProfile() > " +
			ex.toString(), Logger.Types.error);
		
		return {};
	}
	
	if (proxyMode == ProfileManager.ProxyModes.direct)
		return ProfileManager.directConnectionProfile;
	
	var profile = ProfileManager.parseProxyString(proxyString);
	profile.proxyMode = proxyMode;
	profile.proxyExceptions = proxyExceptions;
	profile.proxyConfigUrl = proxyConfigUrl;
	profile = ProfileManager.normalizeProfile(profile);
	
	if (RuleManager.isModifiedSocksProfile(profile)) {
		profile.proxyMode = ProfileManager.ProxyModes.manual;
	}
	
	var foundProfile = ProfileManager.contains(profile);
	if (foundProfile)
		return foundProfile;
	
	profile.unknown = true;
	profile.id = "unknown";
	profile.name = ProfileManager.currentProfileName;
	return profile;
};

ProfileManager.applyProfile = function applyProfile(profile) {
	var plugin = chrome.extension.getBackgroundPage().plugin;
	var direct = (profile.proxyMode == ProfileManager.ProxyModes.direct);
	
	Settings.setObject("selectedProfile", profile);
	
	if (profile.isAutomaticModeProfile)
		RuleManager.saveAutoPacScript();
	else
		profile = ProfileManager.handleSocksProfile(profile);
	
	var proxyString = ProfileManager.buildProxyString(profile);
	
	var connection = "";
	if (Settings.getValue("enableConnections", false))
		connection = Settings.getValue("connectionName");
	
	try {
		var result;
		if (direct) {
			result = plugin.setDirect(connection);
		} else {
			result = plugin.setProxy(profile.proxyMode, proxyString, profile.proxyExceptions, 
									 profile.proxyConfigUrl, connection);
		}
		
		if (result != 0 || result != "0")
			throw "Error Code (" + result + ")";
		
		plugin.notifyChanges(0);
	} catch(ex) {
		Logger.log("Plugin Error @ProfileManager.applyProfile(" + ProfileManager.profileToString(profile, false) + ") > " +
			ex.toString(), Logger.Types.error);
	}
};

ProfileManager.handleSocksProfile = function handleSocksProfile(profile) {
	// TODO if (windows || gnome) only handle SOCKS5
	if (profile.proxyMode == ProfileManager.ProxyModes.manual && profile.proxySocks.trim().length > 0) {
		RuleManager.saveSocksPacScript(profile);
		profile = $.extend(true, {}, profile);
		profile.proxyMode = ProfileManager.ProxyModes.auto;
		profile.proxyConfigUrl = RuleManager.getSocksPacScriptPath(true);
	}
	
	return profile;
};

ProfileManager.getConnections = function getConnections() {
	var plugin = chrome.extension.getBackgroundPage().plugin;
	var connections;
	
	try {
		connections = plugin.getConnections(0);
	} catch(ex) {
		Logger.log("Plugin Error @ProfileManager.getConnections() > " +
			ex.toString(), Logger.Types.error);
		
		return [];
	}
	return connections.split("|");
};

ProfileManager.profileToString = function profileToString(profile, prettyPrint) {
	if (!prettyPrint)
		return "Profile: " + JSON.stringify(profile);
	
	var result = [];
	if (profile.name != undefined)
		result.push(profile.name); 
	
	if (profile.proxyMode == ProfileManager.ProxyModes.manual) {
		if (profile.proxyHttp != undefined && profile.proxyHttp.trim().length > 0)
			result.push("HTTP: " + profile.proxyHttp); 
		
		if (!profile.useSameProxy) {
			if (profile.proxyHttps != undefined && profile.proxyHttps.trim().length > 0)
				result.push("HTTPS: " + profile.proxyHttps); 
	
			if (profile.proxyFtp != undefined && profile.proxyFtp.trim().length > 0)
				result.push("FTP: " + profile.proxyFtp); 
	
			if (profile.proxySocks != undefined && profile.proxySocks.trim().length > 0)
				result.push("SOCKS" + profile.socksVersion + ": " + profile.proxySocks); 
		}
	} else {
//		if (profile.proxyConfigUrl != undefined && profile.proxyConfigUrl.trim().length > 0)
			result.push("PAC Script: " + profile.proxyConfigUrl);
	}
	return result.join("\n");
};

ProfileManager.parseProxyString = function parseProxyString(proxyString) {
	if (!proxyString)
		return {};
	
	var profile;
	if (proxyString.indexOf(";") > 0 || proxyString.indexOf("=") > 0) {
		var proxyParts = proxyString.toLowerCase().split(";");
		profile = { useSameProxy: false, proxyHttp: "", proxyHttps: "", proxyFtp: "", proxySocks: "" };
		for ( var i = 0; i < proxyParts.length; i++) {
			var part = proxyParts[i];
			if (part.indexOf("=:") > 0) // no host value
				continue;
			
			if (part.indexOf("http=") == 0) {
				profile.proxyHttp = part.substring(5);
			} else if (part.indexOf("https=") == 0) {
				profile.proxyHttps = part.substring(6);
			} else if (part.indexOf("ftp=") == 0) {
				profile.proxyFtp = part.substring(4);
			} else if (part.indexOf("socks=") == 0) {
				profile.proxySocks = part.substring(6);
				profile.socksVersion = 4;
			} else if (part.indexOf("socks5=") == 0) {
				profile.proxySocks = part.substring(6);
				profile.socksVersion = 5;
			}
		}
	} else {
		profile = { proxyHttp: proxyString, useSameProxy: true };
	}
	
	return profile;
};

ProfileManager.buildProxyString = function buildProxyString(profile) {
	if (!profile)
		return "";
	
	if (profile.useSameProxy)
		return profile.proxyHttp;
	
	var proxy = [];
	if (profile.proxyHttp)
		proxy.push("http=" + profile.proxyHttp);
	
	if (profile.proxyHttps)
		proxy.push("https=" + profile.proxyHttps);
	
	if (profile.proxyFtp)
		proxy.push("ftp=" + profile.proxyFtp);
	
	if (profile.proxySocks)
		proxy.push("socks=" + profile.proxySocks); // TODO: handle Socks v5
	
	proxy = proxy.join(";");
	return proxy;
};

ProfileManager.normalizeProfile = function normalizeProfile(profile) {
	var newProfile = {
		name: "",
		proxyMode: ProfileManager.ProxyModes.direct,
		proxyHttp : "",
		useSameProxy : true,
		proxyHttps : "",
		proxyFtp : "",
		proxySocks : "",
		socksVersion : 4,
		proxyExceptions : "",
		proxyConfigUrl : "",
		color: "blue"
	};
	$.extend(newProfile, profile);
	return newProfile;
};

ProfileManager.fixProfile = function fixProfile(profile) {
	if (profile.proxy != undefined) {
		profile.proxyHttp = profile.proxy;
		delete profile.proxy;
	}
	if (profile.bypassProxy != undefined) {
		profile.proxyExceptions = profile.bypassProxy;
		delete profile.bypassProxy;
	}
	if (profile.configUrl != undefined) {
		profile.proxyConfigUrl = profile.configUrl;
		delete profile.configUrl;
	}
	if (profile.proxyMode == undefined) {
		if (profile.proxyConfigUrl != undefined && profile.proxyConfigUrl.trim().length > 0)
			profile.proxyMode = ProfileManager.ProxyModes.auto;
		else
			profile.proxyMode = ProfileManager.ProxyModes.manual;
	}
	
	return profile;
};

ProfileManager.hasProfiles = function hasProfiles() {
	var result = false;
	for (i in ProfileManager.profiles) {
		result = true;
		break;
	}
	
	return result;
};

ProfileManager.equals = function equals(profile1, profile2) {
	if (profile1.proxyMode != profile2.proxyMode)
		return false;
	
	if (profile1.proxyMode == ProfileManager.ProxyModes.direct)
		return true;
	
	if (profile1.proxyMode == ProfileManager.ProxyModes.manual) {
		if (profile1.proxyHttp != profile2.proxyHttp || profile1.useSameProxy != profile2.useSameProxy)
			return false;

		if (profile1.useSameProxy)
			return true;

		return (profile1.proxyHttps == profile2.proxyHttps
				&& profile1.proxyFtp == profile2.proxyFtp
				&& profile1.proxySocks == profile2.proxySocks
				/*&& profile1.socksVersion == profile2.socksVersion*/);
	}
	
	if (profile1.proxyMode == ProfileManager.ProxyModes.auto)
		return (profile1.proxyConfigUrl == profile2.proxyConfigUrl);
};

/**
 * Checks if |ProfileManager.profiles| contains a profile identical to the given one.
 * @param profile
 * @return if the profile found returns it, otherwise returns |undefined|.
 */
ProfileManager.contains = function contains(profile) {
	var profiles = ProfileManager.getProfiles();
	for (i in profiles) {
		if (ProfileManager.equals(profiles[i], profile))
			return profiles[i];
	}
	return undefined;
};

ProfileManager.init();