var proxy = function () {};

proxy.prototype.makeItem = function () {
  this.element = document.createElement('div');
  this.element.setAttribute('role', 'listitem');
  this.element.className = "deletable-item";

  var content = document.createElement('div');
  content.style.paddingLeft = "32px";
  this.element.appendChild(content);

  var removeButton = document.createElement('button');
  removeButton.setAttribute('tabindex', '-1');
  removeButton.className = "row-delete-button custom-appearance";
  this.element.appendChild(removeButton);

  var that = this;
  removeButton.addEventListener('click', function () {
    that.unrender();
  }, false);
};

proxy.prototype.makeEditor = function (container) {
  var schemeEditor = document.createElement('select');
  schemeEditor.add(new Option('HTTP'));
  schemeEditor.add(new Option('HTTPS'));
  schemeEditor.add(new Option('SOCKS4'));
  schemeEditor.add(new Option('SOCKS5'));
  schemeEditor.add(new Option('QUIC'));
  schemeEditor.value = this.scheme;
  container.appendChild(schemeEditor);
  container.appendChild(document.createTextNode("://"));
  var hostEditor = document.createElement('input');
  hostEditor.setAttribute("placeholder", "host");
  hostEditor.setAttribute("required", true);
  hostEditor.value = this.host;
  container.appendChild(hostEditor);
  container.appendChild(document.createTextNode(":"));
  var portEditor = document.createElement('input');
  portEditor.setAttribute("pattern", "\\d{1,5}");
  portEditor.setAttribute("placeholder", "port");
  portEditor.setAttribute("size", 5);
  portEditor.value = this.port;
  container.appendChild(portEditor);

  var that = this;
  var editors = [schemeEditor, hostEditor, portEditor];
  for (var idx in editors) {
    editors[idx].addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, false);
    editors[idx].addEventListener('change', function () {
      that.scheme = schemeEditor.value.toLowerCase();
      that.host = hostEditor.value;
      that.port = portEditor.value;
      if (!that.port) {
        if (that.scheme === "http") that.port = 80;
        else if (that.scheme === "quic") that.port = 443;
        else if (that.scheme === "https") that.port = 443;
        else if (that.scheme === "socks4") that.port = 1080;
        else if (that.scheme === "socks5") that.port = 1080;
      }
      that.element.getElementsByClassName('title')[0].innerHTML = "";
      that.element.getElementsByClassName('title')[0].appendChild(that.toHTML());
    }, false);
    editors[idx].addEventListener('focus', function () {
      that.editFocus = true;
    },false);
    editors[idx].addEventListener('blur', function () {
      that.editFocus = false;
      if (!that.container.getAttribute('hasElementFocus')) {
        that.blur();
      }
    },false);
  }
  return editors;
};

proxy.prototype.render = function (container) {
  this.container = container;
  this.makeItem();

  var content = this.element.children[0];
  var viewMode = document.createElement('div');
  viewMode.appendChild(this.toHTML());
  viewMode.setAttribute('displaymode', 'static');
  viewMode.className = "title";
  content.appendChild(viewMode);

  var editMode = document.createElement('div');
  editMode.setAttribute('displaymode', 'edit');
  editMode.className = "editor";
  content.appendChild(editMode);

  this.makeEditor(editMode);

  var that = this;
  this.element.addEventListener('click', function () {
    if(that.element.getAttribute('selected') == null) {
      that.onSelect();
      that.element.setAttribute('selected', true);
    } else if (that.element.getAttribute('editing') === null) {
      that.element.setAttribute('editing', true);
    } else {
      that.element.removeAttribute('editing');
    }
  }, false);

  this.container.appendChild(this.element);
};

proxy.prototype.unrender = function () {
  if (this.container && this.element) {
    this.container.removeChild(this.element);
    this.onRemove();
  }
};

proxy.prototype.onRemove = function () {};
proxy.prototype.onSelect = function () {};

proxy.prototype.blur = function () {
  if (!this.editFocus) {
    this.element.removeAttribute('editing');
  }
};

proxy.prototype.update = function (value) {
  var other = proxy.fromString(value);
  this.scheme = other.scheme;
  this.host = other.host;
  this.port = other.port;
  this.domains = other.domains;
}

proxy.prototype.deselect = function () {
    this.element.removeAttribute('selected');
    this.element.removeAttribute('editing');
};

proxy.prototype.toString = function () {
  var dom = "";
  if (this.domains.length) {
    dom = ";" + this.domains;
  }
  return this.scheme + "://" + this.host + ":" + this.port + dom;
};

proxy.prototype.toHTML = function () {
  var text = document.createElement('span');
  text.innerText = this.scheme + "://" + this.host + ":" + this.port;
  return text;
};

proxy.fromString = function (string) {
  var domains = "";
  if (string.indexOf(";") > -1) {
    var idx = string.indexOf(";");
    domains = string.substr(idx + 1);
    string = string.substr(0, idx);
  }
  if (string.indexOf(",") > -1) {
    var items = string.split(",");
    if (items.length != 4) {
      console.warn("Invalid proxy definition.");
      return new metaproxy([]);
    }
    proxies = [];
    for (var i = 0; i < 4; i += 1) {
      proxies.push(proxy.fromString(items[i]));
    }
    var m = new metaproxy(proxies);
    m.domains = domains;
    return m;
  }
  var parts = /(.*):\/\/(.*):(.*)/g.exec(string);
  var p = new proxy();
  p.scheme = parts[1];
  p.host = parts[2];
  p.port = parts[3];
  p.domains = domains;
  return p;
};

var metaproxy = function (proxies) {
  this.proxies = proxies;
};

for (var i in proxy.prototype) {
  metaproxy.prototype[i] = proxy.prototype[i];
}

metaproxy.prototype.render = function (container) {
  this.container = container;
  this.makeItem();
  for (var i = 0; i < this.proxies.length; i += 1) {
    this.proxies[i].container = this.container;
    this.proxies[i].element = this.element;
    this.proxies[i].toHTML = this.toHTML.bind(this);
  }

  this.element.style.height = "128px";
  var content = this.element.children[0];

  var viewMode = document.createElement('div');
  viewMode.appendChild(this.toHTML());
  viewMode.setAttribute('displaymode', 'static');
  viewMode.className = "title";
  content.appendChild(viewMode);

  var editMode = document.createElement('div');
  editMode.setAttribute('displaymode', 'edit');
  editMode.className = "editor";
  content.appendChild(editMode);

  this.makeEditor.bind(this.proxies[0])(editMode);
  editMode.appendChild(document.createElement("br"));
  this.makeEditor.bind(this.proxies[1])(editMode);
  editMode.appendChild(document.createElement("br"));
  this.makeEditor.bind(this.proxies[2])(editMode);
  editMode.appendChild(document.createElement("br"));
  this.makeEditor.bind(this.proxies[3])(editMode);

  var label = document.createElement('div');
  label.className = "list-tooltip";
  label.innerHTML = "HTTP<br>HTTPS<br>FTP<br>Fallback";
  this.element.insertBefore(label, this.element.lastChild);

  var that = this;
  viewMode.addEventListener('click', function () {
    if(that.element.getAttribute('selected') === null) {
      that.onSelect();
      that.element.setAttribute('selected', true);
    } else {
      that.element.setAttribute('editing', true);
    }
  }, false);
  editMode.addEventListener('click', function () {
    that.element.removeAttribute('editing');
  }, false);

  this.container.appendChild(this.element);
};

metaproxy.prototype.toString = function () {
  var string = "";
  for (var i = 0; i < this.proxies.length; i += 1) {
    string += this.proxies[i].toString() + ",";
  }
  var s = string.substr(0, string.length - 1);
  if (this.domains.length) {
    s += ";" + this.domains;
  }
  return s;
};

metaproxy.prototype.toHTML = function () {
  var x = document.createElement('span');
  for (var i = 0; i < this.proxies.length; i += 1) {
    var y = document.createElement('div');
    y.style.lineHeight = "30px";
    y.innerText = this.proxies[i].toString();
    x.appendChild(y);
  }
  return x;
};

metaproxy.prototype.blur = function () {
  for (var i = 0; i < this.proxies.length; i++) {
    if (this.proxies[i].editFocus) {
      return;
    }
  }
  this.element.removeAttribute('editing');
};
