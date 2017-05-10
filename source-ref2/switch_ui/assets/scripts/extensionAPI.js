/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var chrome = {};
chrome.extension = {};
chrome.extension.connect = function(extensionId, connectInfo) {};
chrome.extension.sendRequest = function(extensionId, request, responseCallback) {};
chrome.extension.getURL = function(path) {};
chrome.extension.getViews = function(fetchProperties) {};
chrome.extension.getBackgroundPage = function() {};
chrome.extension.getToolstrips = function(windowId) {};
chrome.extension.getExtensionTabs = function(windowId) {};
chrome.extension.onConnect = new chrome.Event();
chrome.extension.onConnectExternal = new chrome.Event();
chrome.extension.onRequest = new chrome.Event();
chrome.extension.onRequestExternal = new chrome.Event();
chrome.extension.MessageSender = {
	tab: {},
	id: {}
};
chrome.extension.Event = {
	addListener: function() {},
	removeListener: function() {},
	hasListener: function() {},
	hasListeners: function() {}
};
chrome.extension.Port = {
	name: {},
	onDisconnect: {},
	onMessage: {},
	postMessage: function() {},
	sender: {}
};
chrome.windows = {};
chrome.windows.get = function(windowId, callback) {};
chrome.windows.getCurrent = function(callback) {};
chrome.windows.getLastFocused = function(callback) {};
chrome.windows.getAll = function(getInfo, callback) {};
chrome.windows.create = function(createData, callback) {};
chrome.windows.update = function(windowId, updateInfo, callback) {};
chrome.windows.remove = function(windowId, callback) {};
chrome.windows.onCreated = new chrome.Event();
chrome.windows.onRemoved = new chrome.Event();
chrome.windows.onFocusChanged = new chrome.Event();
chrome.windows.Window = {
	id: {},
	focused: {},
	top: {},
	left: {},
	width: {},
	height: {},
	tabs: {},
	incognito: {},
	type: {}
};
chrome.tabs = {};
chrome.tabs.get = function(tabId, callback) {};
chrome.tabs.getCurrent = function(callback) {};
chrome.tabs.connect = function(tabId, connectInfo) {};
chrome.tabs.sendRequest = function(tabId, request, responseCallback) {};
chrome.tabs.getSelected = function(windowId, callback) {};
chrome.tabs.getAllInWindow = function(windowId, callback) {};
chrome.tabs.create = function(createProperties, callback) {};
chrome.tabs.update = function(tabId, updateProperties, callback) {};
chrome.tabs.move = function(tabId, moveProperties, callback) {};
chrome.tabs.remove = function(tabId, callback) {};
chrome.tabs.detectLanguage = function(tabId, callback) {};
chrome.tabs.captureVisibleTab = function(windowId, options, callback) {};
chrome.tabs.executeScript = function(tabId, details, callback) {};
chrome.tabs.insertCSS = function(tabId, details, callback) {};
chrome.tabs.onCreated = new chrome.Event();
chrome.tabs.onUpdated = new chrome.Event();
chrome.tabs.onMoved = new chrome.Event();
chrome.tabs.onSelectionChanged = new chrome.Event();
chrome.tabs.onDetached = new chrome.Event();
chrome.tabs.onAttached = new chrome.Event();
chrome.tabs.onRemoved = new chrome.Event();
chrome.tabs.Tab = {
	id: {},
	index: {},
	windowId: {},
	selected: {},
	url: {},
	title: {},
	favIconUrl: {},
	status: {},
	incognito: {}
};
chrome.pageActions = {};
chrome.pageActions.enableForTab = function(pageActionId, action) {};
chrome.pageActions.disableForTab = function(pageActionId, action) {};
chrome.pageAction = {};
chrome.pageAction.show = function(tabId) {};
chrome.pageAction.hide = function(tabId) {};
chrome.pageAction.setTitle = function(details) {};
chrome.pageAction.setIcon = function(details) {};
chrome.pageAction.setPopup = function(details) {};
chrome.pageAction.onClicked = new chrome.Event();
chrome.browserAction = {};
chrome.browserAction.setTitle = function(details) {};
chrome.browserAction.setIcon = function(details) {};
chrome.browserAction.setPopup = function(details) {};
chrome.browserAction.setBadgeText = function(details) {};
chrome.browserAction.setBadgeBackgroundColor = function(details) {};
chrome.browserAction.onClicked = new chrome.Event();
chrome.bookmarks = {};
chrome.bookmarks.get = function(idOrIdList, callback) {};
chrome.bookmarks.getChildren = function(id, callback) {};
chrome.bookmarks.getRecent = function(numberOfItems, callback) {};
chrome.bookmarks.getTree = function(callback) {};
chrome.bookmarks.search = function(query, callback) {};
chrome.bookmarks.create = function(bookmark, callback) {};
chrome.bookmarks.move = function(id, destination, callback) {};
chrome.bookmarks.update = function(id, changes, callback) {};
chrome.bookmarks.remove = function(id, callback) {};
chrome.bookmarks.removeTree = function(id, callback) {};
chrome.bookmarks.import = function(callback) {};
chrome.bookmarks.export = function(callback) {};
chrome.bookmarks.onCreated = new chrome.Event();
chrome.bookmarks.onRemoved = new chrome.Event();
chrome.bookmarks.onChanged = new chrome.Event();
chrome.bookmarks.onMoved = new chrome.Event();
chrome.bookmarks.onChildrenReordered = new chrome.Event();
chrome.bookmarks.onImportBegan = new chrome.Event();
chrome.bookmarks.onImportEnded = new chrome.Event();
chrome.bookmarks.BookmarkTreeNode = {
	id: {},
	parentId: {},
	index: {},
	url: {},
	title: {},
	dateAdded: {},
	dateGroupModified: {},
	children: {}
};
chrome.history = {};
chrome.history.search = function(query, callback) {};
chrome.history.getVisits = function(details, callback) {};
chrome.history.addUrl = function(details) {};
chrome.history.deleteUrl = function(details) {};
chrome.history.deleteRange = function(range, callback) {};
chrome.history.deleteAll = function(callback) {};
chrome.history.onVisited = new chrome.Event();
chrome.history.onVisitRemoved = new chrome.Event();
chrome.history.HistoryItem = {
	id: {},
	url: {},
	title: {},
	lastVisitTime: {},
	visitCount: {},
	typedCount: {}
};
chrome.history.VisitItem = {
	id: {},
	visitId: {},
	visitTime: {},
	referringVisitId: {},
	transition: {}
};
chrome.toolstrip = {};
chrome.toolstrip.expand = function(expandInfo, callback) {};
chrome.toolstrip.collapse = function(collapseInfo, callback) {};
chrome.i18n = {};
chrome.i18n.getAcceptLanguages = function(callback) {};
chrome.i18n.getMessage = function(messageName, substitutions) {};
chrome.devtools = {};
chrome.devtools.getTabEvents = function(tab_id) {};
chrome.test = {};
chrome.test.notifyFail = function(message) {};
chrome.test.notifyPass = function(message) {};
chrome.test.resetQuota = function() {};
chrome.test.log = function(message) {};
chrome.test.createIncognitoTab = function(url) {};
chrome.test.onMessage = new chrome.Event();
chrome.extension = {};
chrome.extension.connect = function(extensionId, connectInfo) {};
chrome.extension.sendRequest = function(extensionId, request, responseCallback) {};
chrome.extension.getURL = function(path) {};
chrome.extension.getViews = function(fetchProperties) {};
chrome.extension.getBackgroundPage = function() {};
chrome.extension.getToolstrips = function(windowId) {};
chrome.extension.getExtensionTabs = function(windowId) {};
chrome.extension.onConnect = new chrome.Event();
chrome.extension.onConnectExternal = new chrome.Event();
chrome.extension.onRequest = new chrome.Event();
chrome.extension.onRequestExternal = new chrome.Event();
chrome.extension.MessageSender = {
	tab: {},
	id: {}
};
chrome.extension.Event = {
	addListener: function() {},
	removeListener: function() {},
	hasListener: function() {},
	hasListeners: function() {}
};
chrome.extension.Port = {
	name: {},
	onDisconnect: {},
	onMessage: {},
	postMessage: function() {},
	sender: {}
};
chrome.windows = {};
chrome.windows.get = function(windowId, callback) {};
chrome.windows.getCurrent = function(callback) {};
chrome.windows.getLastFocused = function(callback) {};
chrome.windows.getAll = function(getInfo, callback) {};
chrome.windows.create = function(createData, callback) {};
chrome.windows.update = function(windowId, updateInfo, callback) {};
chrome.windows.remove = function(windowId, callback) {};
chrome.windows.onCreated = new chrome.Event();
chrome.windows.onRemoved = new chrome.Event();
chrome.windows.onFocusChanged = new chrome.Event();
chrome.windows.Window = {
	id: {},
	focused: {},
	top: {},
	left: {},
	width: {},
	height: {},
	tabs: {},
	incognito: {},
	type: {}
};
chrome.tabs = {};
chrome.tabs.get = function(tabId, callback) {};
chrome.tabs.getCurrent = function(callback) {};
chrome.tabs.connect = function(tabId, connectInfo) {};
chrome.tabs.sendRequest = function(tabId, request, responseCallback) {};
chrome.tabs.getSelected = function(windowId, callback) {};
chrome.tabs.getAllInWindow = function(windowId, callback) {};
chrome.tabs.create = function(createProperties, callback) {};
chrome.tabs.update = function(tabId, updateProperties, callback) {};
chrome.tabs.move = function(tabId, moveProperties, callback) {};
chrome.tabs.remove = function(tabId, callback) {};
chrome.tabs.detectLanguage = function(tabId, callback) {};
chrome.tabs.captureVisibleTab = function(windowId, options, callback) {};
chrome.tabs.executeScript = function(tabId, details, callback) {};
chrome.tabs.insertCSS = function(tabId, details, callback) {};
chrome.tabs.onCreated = new chrome.Event();
chrome.tabs.onUpdated = new chrome.Event();
chrome.tabs.onMoved = new chrome.Event();
chrome.tabs.onSelectionChanged = new chrome.Event();
chrome.tabs.onDetached = new chrome.Event();
chrome.tabs.onAttached = new chrome.Event();
chrome.tabs.onRemoved = new chrome.Event();
chrome.tabs.Tab = {
	id: {},
	index: {},
	windowId: {},
	selected: {},
	url: {},
	title: {},
	favIconUrl: {},
	status: {},
	incognito: {}
};
chrome.pageActions = {};
chrome.pageActions.enableForTab = function(pageActionId, action) {};
chrome.pageActions.disableForTab = function(pageActionId, action) {};
chrome.pageAction = {};
chrome.pageAction.show = function(tabId) {};
chrome.pageAction.hide = function(tabId) {};
chrome.pageAction.setTitle = function(details) {};
chrome.pageAction.setIcon = function(details) {};
chrome.pageAction.setPopup = function(details) {};
chrome.pageAction.onClicked = new chrome.Event();
chrome.browserAction = {};
chrome.browserAction.setTitle = function(details) {};
chrome.browserAction.setIcon = function(details) {};
chrome.browserAction.setPopup = function(details) {};
chrome.browserAction.setBadgeText = function(details) {};
chrome.browserAction.setBadgeBackgroundColor = function(details) {};
chrome.browserAction.onClicked = new chrome.Event();
chrome.bookmarks = {};
chrome.bookmarks.get = function(idOrIdList, callback) {};
chrome.bookmarks.getChildren = function(id, callback) {};
chrome.bookmarks.getRecent = function(numberOfItems, callback) {};
chrome.bookmarks.getTree = function(callback) {};
chrome.bookmarks.search = function(query, callback) {};
chrome.bookmarks.create = function(bookmark, callback) {};
chrome.bookmarks.move = function(id, destination, callback) {};
chrome.bookmarks.update = function(id, changes, callback) {};
chrome.bookmarks.remove = function(id, callback) {};
chrome.bookmarks.removeTree = function(id, callback) {};
chrome.bookmarks.import = function(callback) {};
chrome.bookmarks.export = function(callback) {};
chrome.bookmarks.onCreated = new chrome.Event();
chrome.bookmarks.onRemoved = new chrome.Event();
chrome.bookmarks.onChanged = new chrome.Event();
chrome.bookmarks.onMoved = new chrome.Event();
chrome.bookmarks.onChildrenReordered = new chrome.Event();
chrome.bookmarks.onImportBegan = new chrome.Event();
chrome.bookmarks.onImportEnded = new chrome.Event();
chrome.bookmarks.BookmarkTreeNode = {
	id: {},
	parentId: {},
	index: {},
	url: {},
	title: {},
	dateAdded: {},
	dateGroupModified: {},
	children: {}
};
chrome.history = {};
chrome.history.search = function(query, callback) {};
chrome.history.getVisits = function(details, callback) {};
chrome.history.addUrl = function(details) {};
chrome.history.deleteUrl = function(details) {};
chrome.history.deleteRange = function(range, callback) {};
chrome.history.deleteAll = function(callback) {};
chrome.history.onVisited = new chrome.Event();
chrome.history.onVisitRemoved = new chrome.Event();
chrome.history.HistoryItem = {
	id: {},
	url: {},
	title: {},
	lastVisitTime: {},
	visitCount: {},
	typedCount: {}
};
chrome.history.VisitItem = {
	id: {},
	visitId: {},
	visitTime: {},
	referringVisitId: {},
	transition: {}
};
chrome.toolstrip = {};
chrome.toolstrip.expand = function(expandInfo, callback) {};
chrome.toolstrip.collapse = function(collapseInfo, callback) {};
chrome.i18n = {};
chrome.i18n.getAcceptLanguages = function(callback) {};
chrome.i18n.getMessage = function(messageName, substitutions) {};
chrome.devtools = {};
chrome.devtools.getTabEvents = function(tab_id) {};
chrome.test = {};
chrome.test.notifyFail = function(message) {};
chrome.test.notifyPass = function(message) {};
chrome.test.resetQuota = function() {};
chrome.test.log = function(message) {};
chrome.test.createIncognitoTab = function(url) {};
chrome.test.onMessage = new chrome.Event();