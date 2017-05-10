/*/////////////////////////////////////////////////////////////////////////
//                                                                       //
//   Switchy! Chrome Proxy Manager and Switcher                          //
//   Copyright (c) 2009 Mohammad Hejazi (mohammadhi at gmail d0t com)    //
//   Dual licensed under the MIT and GPL licenses.                       //
//                                                                       //
/////////////////////////////////////////////////////////////////////////*/

var Logger = {};

///// Log Types //////
Logger.Types = {
	debug: "debug",
	info: "info",
	success: "success",
	warning: "warning",
	error: "error"
};

///// Event Types //////
Logger.events = {
	onLog: "log"
};

Logger.enabled = true;
Logger.logToConsoleEnabled = true;
Logger.logToAlertEnabled = false;
Logger.logStackTrace = false;
Logger.maxCapacity = 25;
Logger.listeners = [];
Logger.entries = [];

Logger.log = function log(message, type, logStackTrace) {
	if (!Logger.enabled)
		return;
	
	if (!type)
		type = Logger.Types.debug;
	
	if (!logStackTrace)
		logStackTrace = Logger.logStackTrace;
	
	var time = new Date().toLocaleTimeString();
	var formattedMessage = Logger.format(message, type, time);
	var stackTrace = null;
	if (logStackTrace) {
		stackTrace = Logger.getStackTrace();
		formattedMessage += "\nStack Trace:\n" + stackTrace.join("\n");
	}
	
	Logger.dispachEvent(message, formattedMessage, type);
	
	Logger.logToConsole(formattedMessage, type);
	Logger.logToAlert(formattedMessage);
	
	if (Logger.entries.length >= Logger.maxCapacity)
		Logger.entries.shift();
	
	Logger.entries.push({ message: message, type: type, time: time, stackTrace: stackTrace });
};

Logger.logToConsole = function logToConsole(message, type) {
	if (Logger.logToConsoleEnabled) {
		switch (type) {
		case Logger.Types.debug:
			console.debug(message);
			break;

		case Logger.Types.info:
		case Logger.Types.success:
			console.info(message);
			break;

		case Logger.Types.warning:
			console.warn(message);
			break;

		case Logger.Types.error:
			console.error(message);
			break;

		default:
			console.log(message);
			break;
		}
	}
};

Logger.logToAlert = function logToAlert(message) {
	if (Logger.logToAlertEnabled)
		alert(message);
};

Logger.dispachEvent = function dispachEvent(message, formattedMessage, type) {
	var onLogListeners = Logger.listeners[Logger.events.onLog];
	if (onLogListeners != undefined) {
		for (var i in onLogListeners) {
			var fn = onLogListeners[i];
			try {
				fn({ message: message, type: type, formattedMessage: formattedMessage });
			} 
			catch (ex) {}
		}
	}
};

Logger.getStackTrace = function getStackTrace() {
	var anonymous = "<anonymous>";
	var functionRegex  = /function\s*([\w\-$]+)?\s*\(/i;
	var stack = [];
	var functions = [];
	var currentFunction = arguments.callee.caller.caller;
	while (currentFunction) {
		functions.push(currentFunction);
		
		var fn = functionRegex.test(currentFunction.toString()) ? RegExp.$1 || anonymous : anonymous;
		var args = stack.slice.call(currentFunction.arguments);
		var i = args.length;
	    while (i--) {
	        switch (typeof args[i]) {
	            case "string":
					args[i] = '"' + args[i].replace(/"/g, '\\"') + '"';
					break;
					
	            case "function":
					args[i] = "function";
					break;
	        }
	    }
		
	    stack[stack.length] = fn + '(' + args.join(", ") + ')';
		currentFunction = currentFunction.caller;
		if (functions.indexOf(currentFunction) >= 0) {
			console.log("Recursion detected..");
			break;
		}
	}
	
	return stack;
};

Logger.format = function format(message, type, time) {
	if (!time)
		time = new Date().toLocaleTimeString();
	
	if (type && type != Logger.Types.debug)
		message = "[" + type + "] - " + message;
	
	message = "[" + time + "] " + message;
	return message;
};

Logger.toString = function toString() {
	var result = "";
	for (i in Logger.entries) {
		var entry = Logger.entries[i];
		result += Logger.format(entry.message, entry.type, entry.time) + "\n";
		if (Logger.logStackTrace) {
			result += "Stack Trace:\n" + entry.stackTrace.join("\n") + "\n";
			result += "--------------------------------------------\n";
		}

	}
	return result;
};

Logger.clear = function clear() {
	Logger.entries = [];
};

Logger.haveEntryOfType = function haveEntryOfType(type) {
	for (i in Logger.entries) {
		if (Logger.entries[i].type == type)
			return true;
	}
	return false;
};

Logger.haveErrorEntries = function haveErrorEntries() {
	return Logger.haveEntryOfType(Logger.Types.error);
};

Logger.addEventListener = function addEventListener(event, fn) {
	if (!Logger.listeners[event])
		Logger.listeners[event] = [];
	
	if (!(fn in Logger.listeners[event]))
		Logger.listeners[event].push(fn);
};
