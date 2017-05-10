var domainSettings = function() {};

domainSettings.getInstance = function(container) {
  var settings = new domainSettings();
  settings.element = container;
  settings.init();
  return settings;
};

domainSettings.prototype.init = function() {
  this.editor = this.element.getElementsByClassName('editor')[0];
  this.mode = this.element.getElementsByClassName('mode')[0];
  var that = this;
  this.editor.addEventListener('change', function() {
    that.onChange(that.toString());
  }, true);
  this.mode.addEventListener('change', function() {
    that.onChange(that.toString());
  })
};

domainSettings.prototype.toggle = function(el) {
  var that = this.element;
  el.addEventListener('click', function(e) {
    var mode = localStorage['domMode'] || 'none';
    if (mode == 'none') {
      mode = 'block';
    } else {
      mode = 'none';
    }
    localStorage['domMode'] = mode;
    that.style.display = mode;
  }, false);
}

domainSettings.prototype.refresh = function(value) {
  if (value.indexOf(';') > -1) {
    var idx = value.indexOf(';');
    this.base = value.substr(0, idx);
    var val = value.substr(idx + 1);
    this.render(val);
  } else {
    this.base = value;
    this.render('');
  }
};

domainSettings.prototype.onChange = function(value) {}

domainSettings.prototype.toString = function() {
  var dom = this.base + ";";
  if (this.mode.value == 'include') {
    dom += '+';
  } else {
    dom += '-';
  }
  dom += this.editor.value;
  return dom;
};

domainSettings.prototype.render = function(string) {
  if (!this.base) {
    this.editor.value = '';
    this.editor.disabled = true;
    this.mode.disabled = true;
    return;
  } else {
    this.editor.disabled = false;
    this.mode.disabled = false;
  }
  if (string.length && string[0] == '+') {
    this.mode.value = 'include';
  } else if (string.length && string[0] == '-') {
    this.mode.value = 'exclude';
  } else {
    this.mode.value = 'exclude';
    this.editor.value = '';
    return;
  }
  var contents = string.substr(1);
  this.editor.value = contents;
};
