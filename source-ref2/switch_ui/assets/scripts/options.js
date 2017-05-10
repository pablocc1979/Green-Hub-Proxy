/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var extension;
//var ProfileManager;
//var RuleManager;
//var Settings;
//var Logger;
//var Utils;
//var I18n;
var anyValueModified = false;
var ignoreFieldsChanges = false;
var selectedRow;
var selectedRuleRow;
var switchRulesEnabled;
var colors = [ "blue", "green", "red", "yellow", "purple" ];

function init() {
	extension = chrome.extension.getBackgroundPage();
	ProfileManager = extension.ProfileManager;
	RuleManager = extension.RuleManager;
	Settings = extension.Settings;
	Logger = extension.Logger;
	Utils = extension.Utils;
	I18n = extension.I18n;
	
	I18n.process(document);
	document.body.style.visibility = "visible";
	
	initUI();
	loadOptions();
	checkPageParams();
	
	HelpToolTip.enableTooltips();
	showTip();
}

function initUI() {
	// Tab Control
	$("#tabsContainer div").click(function() {
		$("#tabsContainer div").removeClass("selected").addClass("normal");
		$(this).removeClass("normal").addClass("selected");
		$("#body .tab").hide();
		$("#" + $(this).attr("id") + "Body").show();
		if (this.id == "tabImportExport")
			$(".control").hide();
		else
			$(".control").show();
		
		var tabName = $(this).attr("id").toLowerCase().substring(3);
		var url = document.location;
		url = url.protocol + "//" + url.host + url.pathname + url.search + "#tab=" + tabName;
		document.location.href = url;
	});
	
	// Proxy Profiles
	$("#profileName").bind("keyup change", function() {
		$("td:first", selectedRow).text($(this).val()); // sync profile title changes
		selectedRow[0].profile.name = $(this).val();
		onFieldModified(true);
	});
	$("#modeManual, #modeAuto").change(function() {
		if ($("#modeManual").is(":checked")) {
			selectedRow[0].profile.proxyMode = ProfileManager.ProxyModes.manual;
			$("#httpRow, #sameProxyRow, #httpsRow, #ftpRow, #socksRow, #socksVersionRow").removeClass("disabled");
			$("#httpRow input, #sameProxyRow input, #httpsRow input, #ftpRow input, #socksRow input, #socksVersionRow input").removeAttr("disabled");
			$("#configUrlRow").addClass("disabled");
			$("#configUrlRow input").attr("disabled", "disabled");
			$("#useSameProxy").change();
		} else {
			selectedRow[0].profile.proxyMode = ProfileManager.ProxyModes.auto;
			$("#httpRow, #sameProxyRow, #httpsRow, #ftpRow, #socksRow, #socksVersionRow").addClass("disabled");
			$("#httpRow input, #sameProxyRow input, #httpsRow input, #ftpRow input, #socksRow input, #socksVersionRow input").attr("disabled", "disabled");
			$("#configUrlRow").removeClass("disabled");
			$("#configUrlRow input").removeAttr("disabled");
		}
		onFieldModified(true);
	});
	$("#httpProxyHost, #httpProxyPort").change(function() {
		selectedRow[0].profile.proxyHttp = joinProxy($("#httpProxyHost").val(), $("#httpProxyPort").val(), 80);
		onFieldModified(true);
	});
	$("#useSameProxy").change(function() {
		if ($(this).is(":checked")) {
			selectedRow[0].profile.useSameProxy = true;
			$("#httpsRow, #ftpRow, #socksRow, #socksVersionRow").hide();
//			$("#httpsRow, #ftpRow, #socksRow, #socksVersionRow").addClass("disabled");
//			$("#httpsRow input, #ftpRow input, #socksRow input, #socksVersionRow input").attr("disabled", "disabled");
		} else {
			selectedRow[0].profile.useSameProxy = false;
			$("#httpsRow, #ftpRow, #socksRow, #socksVersionRow").show();
//			$("#httpsRow, #ftpRow, #socksRow, #socksVersionRow").removeClass("disabled");
//			$("#httpsRow input, #ftpRow input, #socksRow input, #socksVersionRow input").removeAttr("disabled");
		}
		onFieldModified(true);
	});
	$("#httpsProxyHost, #httpsProxyPort").change(function() {
		selectedRow[0].profile.proxyHttps = joinProxy($("#httpsProxyHost").val(), $("#httpsProxyPort").val(), 443);
		onFieldModified(true);
	});
	$("#ftpProxyHost, #ftpProxyPort").change(function() {
		selectedRow[0].profile.proxyFtp = joinProxy($("#ftpProxyHost").val(), $("#ftpProxyPort").val(), 21);
		onFieldModified(true);
	});
	$("#socksProxyHost, #socksProxyPort").change(function() {
		selectedRow[0].profile.proxySocks = joinProxy($("#socksProxyHost").val(), $("#socksProxyPort").val(), 80);
		onFieldModified(true);
	});		
	$("#socksV4, #socksV5").change(function() {
		selectedRow[0].profile.socksVersion = $("#socksV5").is(":checked") ? 5 : 4;
		onFieldModified(true);
	});		
	$("#proxyExceptions").change(function() {
		selectedRow[0].profile.proxyExceptions = $(this).val();
		onFieldModified(true);
	});		
	$("#proxyConfigUrl").change(function() {
		selectedRow[0].profile.proxyConfigUrl = $(this).val();
		onFieldModified(true);
	});	
	
	// Switch Rules
	$("#cmbDefaultRuleProfile").change(function() {
		var rule = this.parentNode.parentNode.parentNode.rule;
		rule.profileId = $("option:selected", this)[0].profile.id;
		onFieldModified(false);
	});

	$("#chkSwitchRules").change(function() {
//		RuleManager.setEnabled($(this).is(":checked"));
		switchRulesEnabled = $(this).is(":checked");
		if ($(this).is(":checked")) {
			$("#switchRules *, #btnNewRule").removeClass("disabled");
			$("#switchRules input, #switchRules select").removeAttr("disabled");
			$("#chkRuleList").change();
		} else {
			$("#switchRules *, #btnNewRule").addClass("disabled");
			$("#switchRules input, #switchRules select").attr("disabled", "disabled");
		}
		onFieldModified(false);
	});

	$("#rulesTable > tbody > tr > th").click(function() {
		var columnName = $(this).attr("colName");
		if (!columnName)
			return;
		
		this.reverseSorting = !$(this).hasClass("sortedUp");
		$("#rulesTable > tbody > tr > th").removeClass("sortedUp sortedDown");
		$(this).attr("class", this.reverseSorting ? "sortedUp" : "sortedDown");
		
		var rows = $("#rulesTable > tbody > tr:gt(2)");
		rows = $.makeArray(rows);
		
		rows.sort(Utils.createComparer(function (obj) {
			return obj.rule[columnName];
		}, this.reverseSorting));
		
		$("#rulesTable").append(rows);
		
	}).dblclick(function() {
		getSelection().collapse();
	});
	
	$("#chkRuleList").change(function() {
		if ($(this).is(":checked")) {
			$("#ruleListsTable *, #autoProxy").removeClass("disabled");
			$("#ruleListsTable input, #ruleListsTable select, #autoProxy input").removeAttr("disabled");
		} else {
			$("#ruleListsTable *, #autoProxy").addClass("disabled");
			$("#ruleListsTable input, #ruleListsTable select, #autoProxy input").attr("disabled", "disabled");
		}
		onFieldModified(false);
	});

	$("#txtRuleListUrl, #cmbRuleListProfile, #cmbRuleListReload, #chkAutoProxy").change(function() {
		onFieldModified(false);
	});
	
	// Network
	$("#chkConnections").change(function() {
		if ($(this).is(":checked")) {
			$("#connectionsTable *").removeClass("disabled");
			$("#connectionsTable select").removeAttr("disabled");
		} else {
			$("#connectionsTable *").addClass("disabled");
			$("#connectionsTable select").attr("disabled", "disabled");
		}
		onFieldModified(false);
	});

	$("#chkMonitorProxyChanges").change(function() {
		if ($(this).is(":checked"))
			$("#chkPreventProxyChanges").removeAttr("disabled").parent().removeClass("disabled");
		else
			$("#chkPreventProxyChanges").attr("disabled", "disabled").parent().addClass("disabled");
	});

	$("#cmbConnection, #chkMonitorProxyChanges, #chkPreventProxyChanges").change(function() {
		onFieldModified(false);
	});
	
	// Import-Export
	$("#txtBackupFilePath").bind("click keydown", function() {
		if ($(this).hasClass("initial"))
			$(this).removeClass("initial").val("");
	});
	
	// General
	$("#chkQuickSwitch").change(function() {
		if ($(this).is(":checked")) {
			$("#quickSwitchTable *").removeClass("disabled");
			$("#quickSwitchTable input, #quickSwitchTable select").removeAttr("disabled");
			$("#rdoBinarySwitch").change();
		} else {
			$("#quickSwitchTable *").addClass("disabled");
			$("#quickSwitchTable input, #quickSwitchTable select").attr("disabled", "disabled");
		}
		onFieldModified(false);
	});
	$("#rdoBinarySwitch, #rdoCycleSwitch").change(function() {
		if ($("#rdoBinarySwitch").is(":checked")) {
			$("#quickSwitchTable .option").removeClass("disabled");
			$("#quickSwitchTable .option select").removeAttr("disabled");
		} else {
			$("#quickSwitchTable .option").addClass("disabled");
			$("#quickSwitchTable .option select").attr("disabled", "disabled");
		}
		onFieldModified(false);
	});

	$("#chkReapplySelectedProfile, #chkConfirmDeletion").change(function() {
		onFieldModified(false);
	});
	
	// Reverse buttons order on Linux and Mac OS X
	if (!Utils.OS.isWindows) {
		var btnSaveContainer = $("#btnSave").parent();
		btnSaveContainer.next().next().insertBefore(btnSaveContainer);
		btnSaveContainer.next().insertBefore(btnSaveContainer);
	}
}

function loadOptions() {
	ignoreFieldsChanges = true;
	// Proxy Profiles
	$("#proxyProfiles .tableRow").remove();
	var table = $("#proxyProfiles");
	ProfileManager.loadProfiles();
	var profiles = ProfileManager.getSortedProfileArray();
	var profilesTemp = ProfileManager.getProfiles();
	var currentProfile = ProfileManager.getCurrentProfile();
	var lastSelectedProfile = selectedRow;
	selectedRow = undefined;
	for (var i in profiles) {
		var profile = profiles[i];
		if (!profile.id || profile.id.length == 0 || profile.id == "unknown") {
			generateProfileId(profilesTemp, profile);
			profilesTemp[profile.id] = profile;
		}

		var row = newRow(profile);
		
		if (lastSelectedProfile && profile.id == lastSelectedProfile[0].profile.id)
			$("td:first", row).click(); // selects updated profile
	}

	if (currentProfile.unknown) {
		if (!RuleManager.isAutomaticModeEnabled(currentProfile)
			&& currentProfile.proxyMode != ProfileManager.ProxyModes.direct) {
			currentProfile.name = ProfileManager.currentProfileName;
			var row = newRow(currentProfile);
//			if (!selectedRow)
//				$("td:first", row).click();
		}
	} else if (profiles.length == 0) {
		var row = newRow(undefined);
		if (!selectedRow)
			$("td:first", row).click();
	}
	
	if (!selectedRow)
		$("#proxyProfiles .tableRow td:first").click();	
	
	// Switch Rules
	RuleManager.loadRules();
	var defaultRule = RuleManager.getDefaultRule();
	$("#rulesTable .defaultRow")[0].rule = defaultRule;
	switchRulesEnabled = RuleManager.isEnabled();
	if (switchRulesEnabled)
		$("#chkSwitchRules").attr("checked", "checked");
	
	$("#chkSwitchRules").change();

	$("#rulesTable .tableRow").remove();
	table = $("#rulesTable");
	var rules = RuleManager.getSortedRuleArray();
	//var defaultRule = RuleManager.getDefaultRule();
	var rulesTemp = RuleManager.getRules();
	var lastSelectedRule = selectedRuleRow;
	selectedRuleRow = undefined;
	for (var i in rules) {
		var rule = rules[i];
		if (!rule.id || rule.id.length == 0) {
			generateRuleId(rulesTemp, rule);
			rulesTemp[rule.id] = rule;
		}

		var row = newRuleRow(rule, false);		
	}

	if (RuleManager.isRuleListEnabled())
		$("#chkRuleList").attr("checked", "checked");
	
	$("#chkRuleList").change();
	$("#txtRuleListUrl").val(Settings.getValue("ruleListUrl"));	
	$("#cmbRuleListReload option[value='" + Settings.getValue("ruleListReload", 720) + "']").attr("selected", "selected");
	var ruleListProfileId = Settings.getValue("ruleListProfileId");
	if (Settings.getValue("ruleListAutoProxy", false))
		$("#chkAutoProxy").attr("checked", "checked");
	
	// Network
	if (Settings.getValue("enableConnections", false))
		$("#chkConnections").attr("checked", "checked");
	
	$("#chkConnections").change();
	if (!Utils.OS.isWindows) {
		$("#connectionsTable *, #connectionsTitle *").addClass("disabled");
		$("#connectionsTable select, #connectionsTitle input").attr("disabled", "disabled");		
	}
	
	$("#cmbConnection").empty();
	var connections = ProfileManager.getConnections();	
	var selectedConnection = Settings.getValue("connectionName");
	$.each(connections, function(key, connection) {
		var item = $("<option>").attr("value", connection).text(connection);
		if (selectedConnection == connection)
			item.attr("selected", "selected");
		
		$("#cmbConnection").append(item);
	});	

	if (Settings.getValue("monitorProxyChanges", true))
		$("#chkMonitorProxyChanges").attr("checked", "checked");
	if (Settings.getValue("preventProxyChanges", false))
		$("#chkPreventProxyChanges").attr("checked", "checked");

	$("#chkMonitorProxyChanges").change();
	$("#chkPreventProxyChanges").change();
	
	// General
	if (Settings.getValue("quickSwitch", false))
		$("#chkQuickSwitch").attr("checked", "checked");
	
	$("#chkQuickSwitch").change();
	
	if (Settings.getValue("quickSwitchType", "binary") == "cycle")
		$("#rdoCycleSwitch").attr("checked", "checked").change();
	
	$("#cmbProfile1, #cmbProfile2, #cmbDefaultRuleProfile, #cmbRuleListProfile").empty();
	var directProfile = ProfileManager.directConnectionProfile;
	var quickSwitchProfiles = Settings.getObject("quickSwitchProfiles") || {};
	var item = $("<option>").attr("value", directProfile.id).text(directProfile.name);
	item[0].profile = directProfile;
	$("#cmbProfile1").append(item);
	item = item.clone();
	item[0].profile = directProfile;
	$("#cmbProfile2").append(item);
	item = item.clone();
	item[0].profile = directProfile;
	$("#cmbDefaultRuleProfile").append(item);
	item = item.clone();
	item[0].profile = directProfile;
	$("#cmbRuleListProfile").append(item);
	$.each(profiles, function(key, profile) {
		var item = $("<option>").attr("value", profile.id).text(profile.name);
		item[0].profile = profile;
		if (quickSwitchProfiles.profile1 == profile.id)
			item.attr("selected", "selected");
		
		$("#cmbProfile1").append(item);
		
		item = item.clone();
		item[0].profile = profile;
		if (quickSwitchProfiles.profile2 == profile.id)
			item.attr("selected", "selected");

		$("#cmbProfile2").append(item);
		
		item = item.clone();
		item[0].profile = profile;
		if (defaultRule.profileId == profile.id)
			item.attr("selected", "selected");

		$("#cmbDefaultRuleProfile").append(item);
		
		item = item.clone();
		item[0].profile = profile;
		if (ruleListProfileId == profile.id)
			item.attr("selected", "selected");

		$("#cmbRuleListProfile").append(item);
	});	

	if (Settings.getValue("reapplySelectedProfile", false))
		$("#chkReapplySelectedProfile").attr("checked", "checked");
	if (Settings.getValue("confirmDeletion", true))
		$("#chkConfirmDeletion").attr("checked", "checked");
	
	$("#chkReapplySelectedProfile").change();
	$("#chkConfirmDeletion").change();	
	
	// Done
	ignoreFieldsChanges = false;
	anyValueModified = false;
}

function saveOptions() {
	// Proxy Profiles
	var currentProfile = ProfileManager.getCurrentProfile();
	var oldProfiles = ProfileManager.getProfiles();
	var profiles = {};
	var rows = $("#proxyProfiles .tableRow");
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var profile = row.profile;
		if (profile.unknown != undefined) // don't save unknown profiles
			continue;
		
		for (var j in profile)
			if (typeof profile[j] == "string")
				profile[j] = profile[j].trim();
		
		profile.proxyHttp = fixProxyString(profile.proxyHttp, "80");
		profile.proxyHttps = fixProxyString(profile.proxyHttps, "443");
		profile.proxyFtp = fixProxyString(profile.proxyFtp, "21");
		profile.proxySocks = fixProxyString(profile.proxySocks, "80");
		
		if (profile.proxyHttp == profile.proxyHttps 
			&& profile.proxyHttps == profile.proxyFtp 
			&& profile.proxyFtp == profile.proxySocks)
			profile.useSameProxy = true;
		
		if (profile.proxyMode == ProfileManager.ProxyModes.auto && profile.proxyConfigUrl.length == 0)
			profile.proxyMode = ProfileManager.ProxyModes.manual;
		
		if (!profile.id || profile.id.length == 0 || profile.id == "unknown") {
			generateProfileId(oldProfiles, profile);
			oldProfiles[profile.id] = profile; // just for not choosing the same id again.
		}
		
		profiles[profile.id] = profile;
		
		if (profile.name == currentProfile.name) // reapply current profile (in case it's changed)
			ProfileManager.applyProfile(profile);
	}
	
	ProfileManager.setProfiles(profiles);
	ProfileManager.save();
	
	// Switch Rules
	var oldRules = RuleManager.getRules();
	var rules = {};
	rows = $("#rulesTable .tableRow");
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var rule = row.rule;
				
		if (!rule.id || rule.id.length == 0) {
			generateRuleId(oldRules, rule);
			oldRules[rule.id] = rule;
		}
		
		rules[rule.id] = rule;
	}
	var defaultRule = $("#rulesTable .defaultRow")[0].rule;
	
	RuleManager.setEnabled($("#chkSwitchRules").is(":checked"));
	RuleManager.setRules(rules);
	RuleManager.setDefaultRule(defaultRule);

	var ruleListEnabled = $("#chkRuleList").is(":checked");
	if (RuleManager.isEnabled() && (!RuleManager.isRuleListEnabled() && ruleListEnabled)) {
		RuleManager.setRuleListEnabled(true);
		RuleManager.loadRuleList(false);
	}
	RuleManager.setRuleListEnabled(ruleListEnabled);
	Settings.setValue("ruleListUrl", $("#txtRuleListUrl").val());
	Settings.setValue("ruleListReload", $("#cmbRuleListReload option:selected").val());
	Settings.setValue("ruleListProfileId", $("#cmbRuleListProfile option:selected")[0].profile.id);
	if (Settings.setValue("ruleListAutoProxy", $("#chkAutoProxy").is(":checked")));

	RuleManager.save();
	if (RuleManager.isAutomaticModeEnabled(currentProfile))
		ProfileManager.applyProfile(RuleManager.getAutomaticModeProfile(true));
	
	// Network
	Settings.setValue("enableConnections", ($("#chkConnections").is(":checked")));
	Settings.setValue("connectionName", ($("#cmbConnection").val()));

	Settings.setValue("monitorProxyChanges", ($("#chkMonitorProxyChanges").is(":checked")));
	Settings.setValue("preventProxyChanges", ($("#chkPreventProxyChanges").is(":checked")));
	
	// General
	Settings.setValue("quickSwitch", ($("#chkQuickSwitch").is(":checked")));
	Settings.setValue("quickSwitchType", ($("#rdoBinarySwitch").is(":checked") ? "binary" : "cycle"));
	var quickSwitchProfiles = {
		profile1: $("#cmbProfile1 option:selected")[0].profile.id,
		profile2: $("#cmbProfile2 option:selected")[0].profile.id
	};
	Settings.setObject("quickSwitchProfiles", quickSwitchProfiles);

	Settings.setValue("reapplySelectedProfile", ($("#chkReapplySelectedProfile").is(":checked")));
	Settings.setValue("confirmDeletion", ($("#chkConfirmDeletion").is(":checked")));
	
	// Done
	if (Settings.getValue("monitorProxyChanges", true))
		extension.monitorProxyChanges(true);
	
	extension.setIconInfo();
	InfoTip.showMessageI18n("message_optionsSaved", InfoTip.types.success);
	loadOptions();
	anyValueModified = false;
}

function closeWindow() {
	if (anyValueModified && InfoTip.confirmI18n("message_saveChangedValues"))
		saveOptions();
	
	window.close();
}

function switchTab(tab) {
	var tabId;
	switch (tab) {
	case "rules":
		tabId = "tabRules";
		break;

	case "network":
		tabId = "tabNetwork";
		break;

	case "importexport":
		tabId = "tabImportExport";
		break;

	case "general":
		tabId = "tabGeneral";
		break;

	default:
		tabId = "tabProfiles";
		break;
	}
	$("#" + tabId).click();
}

function showTip() {
	var tips = 
		["To make Switchy! work with dial-up/VPN connections, see 'Network' tab.", 
		 "The random number generator is seeded from the current time.", 
		 "Returns a random integer between min and max.",
		 "Using Math.round() will give you a uniform distribution!"];
	
	var index = Math.floor(Math.random() * tips.length);
	$("#tip .text").text(tips[index]);
}

function showLog() {
	var url = "console.html";
//	window.location = url;
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.create({
			url: url,
			index: tab.index + 1
		});
	});
}

function onFieldModified(isChangeInProfile) {
	if (ignoreFieldsChanges) // ignore changes when they're really not changes (populating fields)
		return;

	if (isChangeInProfile && selectedRow != undefined) {
		delete selectedRow[0].profile.unknown; // so it can be saved (when clicking Save)
		selectedRow.removeClass("unknown");
	}
	anyValueModified = true;
}

function generateProfileId(profiles, profile) {
	var profileId = profile.name;
	if (profiles[profileId] != undefined || profileId == ProfileManager.directConnectionProfile.id) {
		for (var j = 2; ; j++) {
			var newId = profileId + j;
			if (profiles[newId] == undefined) {
				profileId = newId;
				break;
			}
		}
	}
	profile.id = profileId;
}

function generateRuleId(rules, rule) {
	var ruleId = rule.name;
	if (rules[ruleId] != undefined) {
		for (var j = 2; ; j++) {
			var newId = ruleId + j;
			if (rules[newId] == undefined) {
				ruleId = newId;
				break;
			}
		}
	}
	rule.id = ruleId;
}

function newRow(profile) {
	var table = $("#proxyProfiles");
	var row = $("#proxyProfiles .templateRow").clone();
	row.removeClass("templateRow").addClass("tableRow");	
	table.append(row);
	
	$("td:first", row).click(onSelectRow);
	
	if (profile) {
		profile = ProfileManager.normalizeProfile(profile);		
		$("td:first", row).text(profile.name);
		$("td:nth(1) div div", row).addClass(profile.color);
//		$("td:nth(0)", row).addClass("c" + profile.color);
		row[0].profile = profile;
		if (profile.unknown)
			row.addClass("unknown");
		
	} else {
		var profileName = $("#proxyProfiles .templateRow td:first").text(); // template name
		var color = colors[Math.floor(Math.random() * colors.length)];
		row[0].profile = {
			name : profileName,
			proxyMode: ProfileManager.ProxyModes.manual,
			proxyHttp : "",
			useSameProxy : false,
			proxyHttps : "",
			proxyFtp : "",
			proxySocks : "",
			socksVersion: 4,
			proxyExceptions : "127.0.0.1; *.local; localhost" + (Utils.OS.isWindows ? "; <local>" : ""),
			proxyConfigUrl : "",
			color: color
		};
		
		$("td:first", row).click();
		$("td:nth(1) div div", row).attr("class", color);
		$("#profileName").focus().select();
	}
	return row;
}

function deleteRow() {
	var row = event.target.parentNode.parentNode;
	if (!Settings.getValue("confirmDeletion", true)
		|| InfoTip.confirmI18n("message_deleteSelectedProfile", row.children[0].innerText)) {
		
		if (selectedRow != undefined && selectedRow[0] == row)
			onSelectRow({}); // to clear fields.
		
		$(row).remove();
		
		saveOptions();
		loadOptions();
		extension.setIconInfo();
		InfoTip.showMessageI18n("message_profileDeleted", InfoTip.types.info);
	}
}

function changeColor() {
	var target = event.target.title ? event.target.children[0] : event.target;
	var cell = $(target);
	var profile = target.parentNode.parentNode.parentNode.profile;
	var color;
	
	for (var i = 0; i < colors.length; i++) {
		color = colors[i];
		if (cell.hasClass(color)) {
			color = colors[i < colors.length - 1 ? i + 1 : 0];
			break;
		}
	}
	
	cell.attr("class", color);
	profile.color = color;
	
	return false;
}

function onSelectRow(e) {
	var profile;
	if (e.target) { // fired on event?
		var row = $(this).parent();
		if (selectedRow)
			selectedRow.removeClass("selected");
		
		row.addClass("selected");
		selectedRow = row;
		
		profile = row[0].profile;
		
	} else { // or by calling
		profile = e;
	}
	
	ignoreFieldsChanges = true;
	
	var proxyInfo;
	$("#profileName").val(profile.name || "");
	
	proxyInfo = parseProxy(profile.proxyHttp || "", 80);
	$("#httpProxyHost").val(proxyInfo.host);
	$("#httpProxyPort").val(proxyInfo.port);
	
	if (profile.useSameProxy) {
		$("#useSameProxy").attr("checked", "checked");
	}
	else {
		$("#useSameProxy").removeAttr("checked");
	}
	$("#useSameProxy").change();

	if (profile.proxyMode == ProfileManager.ProxyModes.manual) {
		$("#modeManual").attr("checked", "checked");
		$("#modeAuto").removeAttr("checked");
	}
	else {
		$("#modeManual").removeAttr("checked");
		$("#modeAuto").attr("checked", "checked");
	}
	$("#modeManual").change();
	
	proxyInfo = parseProxy(profile.proxyHttps || "", 443);
	$("#httpsProxyHost").val(proxyInfo.host);
	$("#httpsProxyPort").val(proxyInfo.port);

	proxyInfo = parseProxy(profile.proxyFtp || "", 21);
	$("#ftpProxyHost").val(proxyInfo.host);
	$("#ftpProxyPort").val(proxyInfo.port);

	proxyInfo = parseProxy(profile.proxySocks || "", 80);
	$("#socksProxyHost").val(proxyInfo.host);
	$("#socksProxyPort").val(proxyInfo.port);

	if (profile.socksVersion == 5)
		$("#socksV5").attr("checked", "checked");
	else
		$("#socksV4").attr("checked", "checked");
	
	$("#proxyExceptions").val(profile.proxyExceptions || "");
	
	$("#proxyConfigUrl").val(profile.proxyConfigUrl || "");

	$("#profileName").focus().select();

	ignoreFieldsChanges = false;
}

function enterFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);
	if (input.is(":visible"))
		return;
	
	input.val(span.text());
	input.toggle();
	span.toggle();
	input.focus();
//	input.select();
}

function exitFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);
	var newValue = input.val();
	if (newValue == "")
		newValue = "\x0b\x20"; // workaround for jQuery bug (toggling an empty span).
		
	if (!anyValueModified)
		anyValueModified = (span.text() != newValue);
	
	var rule = cell.parentNode.parentNode.rule;
	rule[input.attr("name")] = input.val();
	
	span.text(newValue);
	input.toggle();
	span.toggle();
}

function newRuleRow(rule, activate) {
	if (!rule && !switchRulesEnabled)
		return;
	
	var table = $("#rulesTable");
	var row = $("#rulesTable .templateRow").clone();
	var cell = row.children(":first-child");
	row.removeClass("templateRow").addClass("tableRow");	
	table.append(row);
	
	$("td", row).click(function() {
		if (switchRulesEnabled)
			enterFieldEditMode(this);
	});
	$("input", row).blur(function() {
		exitFieldEditMode(this.parentNode);
	}).keypress(function() {
		if (event.keyCode == 13) // Enter Key
			$(event.target).blur();
	});
	$("input, select", row).keydown(function() {
		if (event.keyCode == 9) { // Tab Key
			$(event.target).blur();
			var nextFieldCell;
			if (!event.shiftKey)
				nextFieldCell = event.target.parentNode.parentNode.nextElementSibling;
			else
				nextFieldCell = event.target.parentNode.parentNode.previousElementSibling;
			
			$(nextFieldCell).click();
			$("input, select", nextFieldCell).focus().select();
			return false;
		}
	});

	var combobox = $("select[name='profileId']", row);
	var profiles = ProfileManager.getSortedProfileArray();
	var directProfile = ProfileManager.directConnectionProfile;
	var item = $("<option>").attr("value", directProfile.id).text(directProfile.name);
	item[0].profile = directProfile;
	combobox.append(item);
	$.each(profiles, function(key, profile) {
		var item = $("<option>").attr("value", profile.id).text(profile.name);
		item[0].profile = profile;
		if (rule && rule.profileId == profile.id)
			item.attr("selected", "selected");
		
		combobox.append(item);
	});	
	combobox.change(function() {
		var rule = this.parentNode.parentNode.parentNode.rule;
		rule.profileId = $("option:selected", this)[0].profile.id;
		anyValueModified = true;
	});
	
	combobox = $("select[name='patternType']", row);
	if (rule)
		$("option[value='" + rule.patternType + "']", combobox).attr("selected", "selected");
	
	combobox.change(function() {
		var rule = this.parentNode.parentNode.parentNode.rule;
		rule.patternType = $("option:selected", this).val();
		anyValueModified = true;
	});
	
	if (rule) {
		row[0].rule = rule;
		$(".ruleName", row).text(rule.name);
		$(".urlPattern", row).text(rule.urlPattern);
	} else {
		var ruleName = $("#proxyProfiles .templateRow td:first").text(); // template name
		row[0].rule = {
			name: ruleName,
			urlPattern: "",
			patternType: RuleManager.PatternTypes.wildcard,
			profileId: ProfileManager.directConnectionProfile.id
		};
	}
	if (activate) {
		$("td:first", row).click();
		$("td:first input", row).select();
	}
}

function deleteRuleRow() {
	var row = event.target.parentNode.parentNode;
	if (switchRulesEnabled
		&& (!Settings.getValue("confirmDeletion", true) 
			|| InfoTip.confirmI18n("message_deleteSelectedRule", row.children[0].innerText))) {
		$(row).remove();
		saveOptions();
		loadOptions();
		extension.setIconInfo();
		InfoTip.showMessageI18n("message_ruleDeleted", InfoTip.types.info);
	}
}

function saveFileAs(fileName, fileData) {
	var filePath;
	try {
		filePath = extension.plugin.writeTempFile(fileData, fileName);
		if (!filePath || filePath.trim().length == 0)
			throw "Error";
	} catch (e) {
		Logger.log("Oops! Can't save generated file, " + e.toString(), Logger.Types.error);
		InfoTip.alertI18n("message_cannotSaveFile");
		return;
	}
	
	if (filePath.substr(0, 7) != "file://")
		filePath = "file://" + filePath;
	
	chrome.tabs.create({
		url: filePath
	});
}

function exportPacFile() {
	var script = RuleManager.generateAutoPacScript();

	saveFileAs("SwitchyPac.pac", script);
}

function exportRuleList() {
	var ruleListData = RuleManager.generateRuleList();
	
	saveFileAs("SwitchyRules.txt", ruleListData);
}

function makeBackup() {
	var options = {};
	for (var optionName in localStorage)
		if (optionName != "ruleListRules")
			options[optionName] = localStorage[optionName];
	
	var backupData = JSON.stringify(options);
	var backupData = $.base64Encode(backupData);
	
	saveFileAs("SwitchyOptions.bak", backupData);
}

function restoreBackup() {
	var txtBackupFilePath = $("#txtBackupFilePath");
	if (txtBackupFilePath.hasClass("initial") || txtBackupFilePath.val().trim().length == 0) {
		InfoTip.alertI18n("message_selectBackupFile");
		txtBackupFilePath.focus();
		return;
	}
	var backupFilePath = txtBackupFilePath.val();
	var backupData = undefined;
	
	if (backupFilePath.substr(0, 7) == "http://" || backupFilePath.substr(0, 8) == "https://") {
		$.ajax({
			async: false,
			url: backupFilePath,
			success: function(data, textStatus){
				if (data.length <= 1024 * 50) // bigger than 50 KB
					backupData = data;
				else
					Logger.log("Too big backup file!", Logger.Types.error);
			},
			error: function(request, textStatus, thrownError){
				Logger.log("Error downloading the backup file!", Logger.Types.warning);
			},
			dataType: "text",
			cache: false,
			timeout: 10000
		});	
	}
	else {
		try {
			backupData = extension.plugin.readFile(backupFilePath);
		} catch (e) {
			Logger.log("Oops! Can't read the backup file, " + e.toString(), Logger.Types.error);
			InfoTip.alertI18n("message_cannotReadOptionsBackup");
			return;
		}
	}
	
	if (!backupData || backupData.trim().length == 0) {
		InfoTip.alertI18n("message_cannotRestoreOptionsBackup");
		return;
	}
	
	var options;
	try {
		backupData = $.base64Decode(backupData);
		options = JSON.parse(backupData);
	} catch (e) {
		Logger.log("Oops! Can't restore from this backup file. The backup file is corrupted or invalid, " + e.toString(), Logger.Types.error);
		InfoTip.alertI18n("message_cannotRestoreOptionsBackup");
		return;
	}
	
	if (!InfoTip.confirmI18n("message_restoreOptionsBackup"))
		return;
	
//	for (var optionName in options)
//		localStorage[optionName] = options[optionName];
//	
//	Settings.setValue("ruleListEnabled", false); // for security concerns

	InfoTip.alertI18n("message_successRestoreOptionsBackup");

//	window.location.reload();
}

function getQueryParams() {
	// parse query
	var query = document.location.search || "";
	if (query.indexOf("?") == 0)
		query = query.substring(1);
	
	query = query.split("&");
	
	var params = [];
	for (i in query) {
		var pair = query[i].split("=");
		params[pair[0]] = pair[1];
	}
	
	// parse hash
	query = document.location.hash || "";
	if (query.indexOf("#") == 0)
		query = query.substring(1);
	
	query = query.split("&");
	
	for (i in query) {
		var pair = query[i].split("=");
		params[pair[0]] = pair[1];
	}
	
	return params;
}

function checkPageParams() {
	var params = getQueryParams();
	if (params["firstTime"] == "true")
		InfoTip.showMessageI18n("message_firstTimeWelcome", InfoTip.types.note, -1);
	
	if (params["rulesFirstTime"] == "true")
		InfoTip.showMessageI18n("message_rulesFirstTimeWelcome", InfoTip.types.note, -1);

	switchTab(params["tab"]);
}

function parseProxy(proxy, port) {
	if (proxy == undefined || proxy.length == 0) {
		return {
			host : "",
			port : ""
		};
	}
	
	proxy = fixProxyString(proxy, port);
	var pos = proxy.lastIndexOf(":");
	var host = (pos > 0 ? proxy.substring(0, pos) : proxy);
	var port = (pos > 0 ? proxy.substring(pos + 1) : "");
	return {
		host : host,
		port : port
	};
}

function joinProxy(proxy, port, defaultPort) {
	if (proxy.indexOf(":") >= 0)
		return proxy;
	
	if (port != undefined && port.trim().length == 0)
		port = defaultPort || "80";
	
	return proxy + ":" + port;
}

function fixProxyString(proxy, defaultPort) {
	if (proxy == undefined || proxy.length == 0)
		return "";
	
	if (proxy.indexOf(":") > 0)
		return proxy;

	if (proxy.indexOf(":") == 0)
		return "";
		
	defaultPort = defaultPort || "80";
	return proxy + ":" + defaultPort;
}
