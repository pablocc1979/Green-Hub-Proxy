function getState() {
  return localStorage['state'] || "false";
}

function getScope() {
  return (localStorage['incognito'] === 'checked') ?
      'incognito_persistent' : 'regular';
}

function splitProxy(string) {
  var parts = /(.*):\/\/(.*):(.*)/g.exec(string);
  return {
    scheme: cleanscheme(parts[1]),
    host: parts[2],
    port: parseInt(parts[3])
  };
}

function loadProxy(rules) {
  var proxy = localStorage['proxy'] || 'http://localhost:8080';
  var domain = "";
  if (proxy.indexOf(";") > -1) {
    var domIdx = proxy.indexOf(";");
    domain = proxy.substr(domIdx + 1);
    proxy = proxy.substr(0, domIdx);
  }
  if (proxy.indexOf(",") > -1) {
    var items = proxy.split(",");
    var keys = ['proxyForHttp', 'proxyForHttps', 'proxyForFtp', 'fallbackProxy'];
    for (var i = 0; i < keys.length; i++) {
      rules[keys[i]] = splitProxy(items[i]);
    }
  } else {
    rules['singleProxy'] = splitProxy(proxy);
  }
  
  if (domain && domain[0] == "+") {
    var pxy = "DIRECT";
    if (rules['singleProxy']['scheme'] === "socks4" ||
        rules['singleProxy']['scheme'] === "socks5") {
      pxy = "SOCKS " + rules['singleProxy']['host'] + ":" + rules['singleProxy']['port'];
    } else if (rules['singleProxy']['scheme']) {
      pxy = "PROXY " + rules['singleProxy']['host'] + ":" + rules['singleProxy']['port'];
    }
    var domains = JSON.stringify(domain.substr(1));
    rules['PacScript'] = {
      'data':
        "var domains = " + domains + ";\n" +
        "function FindProxyForURL(url, host) {\n" +
        "  var rules = domains.split('\\n');\n" +
        "  for (var i = 0; i < rules.length; i++) {\n" +
        "    if (shExpMatch(host, rules[i])) {\n" +
        "      return '" + pxy + "';\n" +
        "    }\n" +
        "  }\n" +
        "  return 'DIRECT';\n" +
        "}\n"
    };
  } else if (domain && domain[0] == "-"){
    rules['bypassList'] = domain.substr(1).split("\n");
  }
}

function cleanscheme(s) {
  s = s.toLowerCase();
  if (s === "socks 4") s = "socks4";
  if (s === "socks 5") s = "socks5";
  return s;
};

function setup() {
  var proxy = "http://localhost:8080";
  localStorage['proxy'] = proxy;
  localStorage['proxies'] = JSON.stringify([proxy]);
};


function setProxy() {
  if(!localStorage['proxy']) {
    setup();
  }

  var state = getState();
  if (state != "false") {
    chrome.browserAction.setBadgeText({
      text: chrome.i18n.getMessage("browserActionOn")
    });
    chrome.browserAction.setBadgeBackgroundColor({color: [110, 210, 80, 180]});

    var proxysettings = {
      mode: 'fixed_servers',
      rules: {}
    };

    loadProxy(proxysettings.rules);

    if (proxysettings.rules.PacScript) {
      proxysettings = {
        mode: 'pac_script',
        pacScript: proxysettings.rules.PacScript
      };
    }

    console.log(proxysettings);
    chrome.proxy.settings.set({
      'value': proxysettings,
      'scope': getScope()
    }, function() {});
  } else {
    chrome.browserAction.setBadgeBackgroundColor({color: [130, 130, 130, 180]});
    chrome.browserAction.setBadgeText({
      text: chrome.i18n.getMessage("browserActionOff")
    });
    if (localStorage['off'] in ['system', 'auto_detect', 'direct']) {
      var proxysettings = {mode: localStorage['off']};
      chrome.proxy.settings.set({
        'value': proxysettings,
        'scope': getScope()
      }, function() {});
    } else {
      chrome.proxy.settings.clear({'scope': getScope()});
    }
  }
}

function clearProxy() {
  chrome.proxy.settings.clear({'scope': 'regular'});
  chrome.proxy.settings.clear({'scope': 'incognito_persistent'});
  chrome.proxy.settings.clear({'scope': 'incognito_session_only'});
}

function clickListener() {
  var state = getState();
  if (state == "false") {
    state = "true";
  } else {
    state = "false";
  }
  localStorage['state'] = state;
  setProxy();
}

function requestListener(request, sender, sendResponse) {
  if (request['cmd'] === 'start_save') {
    var state = getState();
    localStorage['savedState'] = state
    if (state === "true") {
      clickListener()
    } else {
      setProxy();
    }
  } else if (request['cmd'] === 'clear') {
    clearProxy();
  } else if (request['cmd'] === 'get_statistics') {
    updateStatistics('stats');
    var stats = JSON.parse(localStorage['stats']);
    sendResponse(stats);
    return;
  } else if (request['cmd'] === 'set_statistics') {
    localStorage['collectStats'] = request['value'];
    updateStatistics('stats');
    var stats = JSON.parse(localStorage['stats']);
    sendResponse(stats);
    return;
  } else { //end save
    if (localStorage['savedState'] === "true") {
      clickListener();
    } else {
      setProxy();
    }
  }
  sendResponse();
}

function errorListener(details) {
  console.log(details);
  if (getState() == "true") {
    chrome.browserAction.setBadgeBackgroundColor({color: [210, 110, 80, 180]});
  }
  updateStatistics("error");
}

function changeListener(details) {
  if (details.value.mode == "fixed_servers" || details.value.mode == "pac_script" ) {
    if (details.value.mode == "fixed_servers") {
      for (var rule in details.value.rules) {
        if (details.value.rules[rule].host && (
            details.value.rules[rule].host.toLowerCase() == "localhost" ||
            details.value.rules[rule].host == "127.0.0.1")) {
          updateStatistics("local");
          return;
        }
      }
    }
    updateStatistics("remote");
  } else {
    updateStatistics("off");
  }
}

function updateStatistics(why) {
  var stats;
  try {
    stats = JSON.parse(localStorage['stats']);
  } catch(e) {
    stats = {
      last: new Date().valueOf(),
      lastCheck: new Date().valueOf(),
      lastState: false, 
      countedTime: 0,
      localUsage: 0,
      remoteUsage: 0,
      errors: 0,
      flips: 0
    };
  }
  if (localStorage['collectStats'] == "false") {
    stats = {countedTime: 0, optout: true};
    localStorage['stats'] = JSON.stringify(stats);
    return;
  } else if (stats.optout) {
    stats = {
      last: new Date().valueOf(),
      lastCheck: new Date().valueOf(),
      lastState: false, 
      countedTime: 0,
      localUsage: 0,
      remoteUsage: 0,
      errors: 0,
      flips: 0
    };
  }
  var now = new Date();
  if (stats.lastState == 'local') {
    stats.localUsage += (now - stats.last);
  } else if (stats.lastState == 'remote') {
    stats.remoteUsage += (now - stats.last);
  }
  stats.countedTime += (now - stats.last);
  stats.last = now.valueOf();
  if (why == 'local' || why == 'remote' || why == 'off') {
    stats.lastState = why;
    stats.flips += 1;
  } else if (why == 'error') {
    stats.errors += 1;
  }
  var lc = stats.lastCheck || new Date().valueOf();
  stats.lastCheck = lc;
  if (!stats.lastState && !(why == 'error') &&
      (lc + 1000 * 60 * 60 * 24) < new Date().valueOf()) {
    stats.lastCheck = new Date().valueOf();
    saveUsage([
      ['usage', ['local', stats.localUsage]],
      ['usage', ['remote', stats.remoteUsage]],
      ['usage', ['total', stats.countedTime]],
      ['events', stats.flips],
      ['errors', stats.errors]
    ]);
  }
  localStorage['stats'] = JSON.stringify(stats);
}

function saveUsage(events) {
  var g = document.createElement('script'), i = 0;
  g.type = 'text/javascript'; g.async = true;
  g.src = 'https://ssl.google-analytics.com/ga.js';
  g.addEventListener('load', function() {
    _gaq.push(['_setAccount', 'UA-471290-9']);
    for (i = 0; i < events.length; i += 1) {
      _gaq.push(['_trackEvent'].concat(events[i]));
    }
  }, true);
  document.head.appendChild(g);
}

function installListener()
{
  startupListener();
  if (localStorage['state'] == undefined) {
    // First Install.
    chrome.browserAction.setBadgeBackgroundColor({color: [210, 110, 80, 180]});
    chrome.browserAction.setBadgeText({
      text: "!"
    });
    chrome.browserAction.onClicked.removeListener(clickListener);
    chrome.browserAction.onClicked.addListener(firstClickListener);
  }
}

function firstClickListener() {
  window.open("options.html");
  chrome.browserAction.onClicked.removeListener(firstClickListener);
  chrome.browserAction.onClicked.addListener(clickListener);
  setProxy();	
}

function startupListener() {
  // Initial View.
  chrome.browserAction.setIcon({path: "icon-19.png"});
  chrome.browserAction.setBadgeBackgroundColor({color:[130, 130, 130, 180]});

  // Restore state.
  setProxy();	
}

/**
 * Initialization.
 */
chrome.browserAction.onClicked.addListener(clickListener);
chrome.extension.onMessage.addListener(requestListener);
chrome.proxy.onProxyError.addListener(errorListener);
chrome.proxy.settings.onChange.addListener(changeListener);
chrome.runtime.onStartup.addListener(startupListener);
chrome.runtime.onInstalled.addListener(installListener);

