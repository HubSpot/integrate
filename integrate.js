(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var PauseStep, Steps, Workspace,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Workspace = require("../models/workspace.coffee");

PauseStep = require("../steps/pause.coffee");

Steps = (function(_super) {
  __extends(Steps, _super);

  function Steps() {
    return Steps.__super__.constructor.apply(this, arguments);
  }

  Steps.prototype.initialize = function(models, options) {
    if (options == null) {
      options = {};
    }
    Steps.__super__.initialize.apply(this, arguments);
    return _.defaults(this, options, {
      stepInsertionIndex: 0,
      pendingSteps: [],
      selected: null,
      workspace: new Workspace(),
      errorMessage: void 0,
      speed: this.INTERVAL_SPEEDS.FAST
    });
  };

  Steps.prototype.END = "STEPS_END";

  Steps.prototype.ERROR = "STEPS_ERROR";

  Steps.prototype.INTERVAL_SPEEDS = {
    FAST: 400,
    SLOW: 1000
  };

  Steps.prototype.run = function() {
    if (!this.selected) {
      this.select(this.first());
    }
    this.stop();
    return this.interval = setInterval((function(_this) {
      return function() {
        var allDone, error, _base;
        try {
          allDone = _this.performCurrentStep();
          if (allDone) {
            _this.select(_this.END);
            _this.stop();
            return _this.trigger('success');
          } else {
            return typeof (_base = _this.selected).getTarget === "function" ? _base.getTarget(_this.workspace) : void 0;
          }
        } catch (_error) {
          error = _error;
          _this.errorMessage = error.message;
          _this.select(_this.ERROR);
          _this.stop();
          _this.trigger('failure');
          throw error;
        }
      };
    })(this), this.speed);
  };

  Steps.prototype.stop = function() {
    return clearInterval(this.interval);
  };

  Steps.prototype.pause = function() {
    var currentIndex, pause;
    this.stop();
    currentIndex = this.indexOf(this.selected);
    pause = new PauseStep();
    pause.manual = true;
    this.add(pause, {
      at: currentIndex
    });
    this.select(pause);
    return this.run();
  };

  Steps.prototype.add = function(steps) {
    var result;
    if (this.performing) {
      this.pendingSteps = this.pendingSteps.concat(steps);
    } else {
      result = Steps.__super__.add.call(this, steps, {
        at: this.stepInsertionIndex
      });
      this.stepInsertionIndex += 1;
      return result;
    }
  };

  Steps.prototype.changeIntervalSpeed = function(speed) {
    this.stop();
    this.speed = speed;
    this.trigger("change:speed");
    if (!(this.selected === this.END || this.selected === this.ERROR)) {
      return this.run();
    }
  };

  Steps.prototype.performCurrentStep = function() {
    var allDone, next, outcome;
    allDone = true;
    if (!this.selected) {
      return allDone;
    }
    this.performing = true;
    outcome = this.selected.perform(this.workspace);
    this.performing = false;
    if (outcome) {
      this.add(this.pendingSteps);
      this.pendingSteps = [];
    } else {
      this.incrementFailures();
      this.pendingSteps = [];
      return !allDone;
    }
    next = this.at(this.indexOf(this.selected) + 1);
    if (next != null) {
      this.select(next);
      return !allDone;
    } else {
      return allDone;
    }
  };

  Steps.prototype.incrementFailures = function() {
    var currentNumFailures;
    if (this.selected.constructor.isPause) {
      return;
    }
    currentNumFailures = this.selected.get("numFailures") || 0;
    return this.selected.set("numFailures", currentNumFailures + 1);
  };

  Steps.prototype.select = function(selected) {
    var _ref;
    this.selected = selected;
    this.stepInsertionIndex = this.indexOf(this.selected) + 1;
    this.trigger("change:selected", this.selected);
    if (((_ref = this.selected) != null ? _ref.on : void 0) != null) {
      return this.listenTo(this.selected, "warning", function(args) {
        return this.trigger("warning", args);
      }, this);
    }
  };

  return Steps;

})(Backbone.Collection);

module.exports = Steps;


},{"../models/workspace.coffee":3,"../steps/pause.coffee":10}],2:[function(require,module,exports){
var Passer, PauseStep, Steps, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

PauseStep = require("../steps/pause.coffee");

Steps = require("../collections/steps.coffee");

Passer = (function(_super) {
  __extends(Passer, _super);

  function Passer() {
    return Passer.__super__.constructor.apply(this, arguments);
  }

  Passer.prototype.defaults = {
    retriesRemaining: 40,
    status: void 0,
    mode: "fast"
  };

  Passer.prototype.STATUSES = {
    FAIL: "FAIL_STATUS",
    WARN: "WARN_STATUS",
    PASS: "PASS_STATUS",
    RUNNING: "RUNNING_STATUS",
    PAUSED: "PAUSED_STATUS"
  };

  Passer.prototype.initialize = function(options) {
    this.collection = options.collection;
    if ((typeof sessionStorage !== "undefined" && sessionStorage !== null ? sessionStorage.integrateSpeed : void 0) != null) {
      this.set("mode", sessionStorage.integrateSpeed);
      this._updateIntervalSpeed();
    }
    this.collection.on("change:selected", (function(_this) {
      return function() {
        _this.selected = _this.collection.selected;
        if (_this.selected.on != null) {
          _this.listenTo(_this.selected, "change:numFailures", _this.grade, _this);
        }
        return _this.grade(_this.selected);
      };
    })(this));
    return this.listenTo(this, "change:mode", (function(_this) {
      return function() {
        var mode;
        mode = _this.get("mode");
        sessionStorage.integrateSpeed = mode;
        return _this._updateIntervalSpeed();
      };
    })(this));
  };

  Passer.prototype._updateIntervalSpeed = function() {
    var mode, speed;
    mode = this.get("mode");
    speed = Steps.prototype.INTERVAL_SPEEDS[mode.toUpperCase()];
    return this.collection.changeIntervalSpeed(speed);
  };

  Passer.prototype.grade = function() {
    var maxRetries, remaining;
    if (this.selected === Steps.prototype.END) {
      this.set("status", this.STATUSES.PASS);
      this.collection.stop();
      return;
    }
    if (this.selected === Steps.prototype.ERROR) {
      this.set("status", this.STATUSES.FAIL);
      return;
    }
    maxRetries = this.selected.maxRetries || 100;
    remaining = maxRetries - (this.selected.get("numFailures") || 0);
    this.set("retriesRemaining", remaining);
    if (remaining <= 0) {
      this.set("status", this.STATUSES.FAIL);
      return this.collection.stop();
    } else if (remaining <= (maxRetries / 2)) {
      return this.set("status", this.STATUSES.WARN);
    } else if (this.collection.selected instanceof PauseStep) {
      return this.set("status", this.STATUSES.PAUSED);
    } else {
      return this.set("status", this.STATUSES.RUNNING);
    }
  };

  return Passer;

})(Backbone.Model);

module.exports = Passer;


},{"../collections/steps.coffee":1,"../steps/pause.coffee":10,"../utils.coffee":17}],3:[function(require,module,exports){
var Workspace,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Workspace = (function(_super) {
  __extends(Workspace, _super);

  function Workspace() {
    return Workspace.__super__.constructor.apply(this, arguments);
  }

  Workspace.prototype.initialize = function() {
    return this.on("change:url", this.updateFrame, this);
  };

  Workspace.prototype.defaults = {
    $iframe: void 0,
    $page: void 0,
    url: ""
  };

  Workspace.prototype.updateFrame = function() {
    window.$page = this.getPage();
    return window.$p = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = window.$page).find.apply(_ref, args);
    };
  };

  Workspace.prototype.getPage = function() {
    return this.getIframe().contents();
  };

  Workspace.prototype.getIframe = function() {
    if (this.get("$iframe") == null) {
      this.set("$iframe", this._createIframe());
    }
    return this.get("$iframe");
  };

  Workspace.prototype.getIframeURL = function() {
    return this.get('url');
  };

  Workspace.prototype._createIframe = function() {
    var $iframe, that;
    $iframe = this._getRootIframe();
    that = this;
    return $iframe.load(function() {
      var iframeURL;
      iframeURL = this.contentWindow.location.pathname;
      that.set('url', iframeURL, {
        silent: true
      });
      return that.updateFrame();
    });
  };

  Workspace.prototype._getRootIframe = function() {
    return $("iframe#integrate-workspace");
  };

  Workspace.prototype.focusIframe = function($iframe) {
    if ($iframe == null) {
      this.set("$iframe", this._getRootIframe());
    } else {
      this.set("$iframe", $iframe);
    }
    this.updateFrame();
    return console.log("Set the iframe");
  };

  return Workspace;

})(Backbone.Model);

module.exports = Workspace;


},{}],4:[function(require,module,exports){
var AssertURLStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

AssertURLStep = (function(_super) {
  __extends(AssertURLStep, _super);

  function AssertURLStep(stringOrRegex) {
    this.stringOrRegex = stringOrRegex;
    AssertURLStep.__super__.constructor.call(this);
  }

  AssertURLStep.prototype.announcement = function() {
    return "Expecting the iframe URL to match: <pre>" + this.stringOrRegex + "</pre>";
  };

  AssertURLStep.prototype.perform = function(workspace) {
    var currentIframeURL;
    currentIframeURL = workspace.getIframeURL();
    if (typeof this.stringOrRegex === 'string') {
      return this.stringOrRegex === currentIframeURL;
    } else if (typeof this.stringOrRegex === 'object' && (this.stringOrRegex.test != null)) {
      return this.stringOrRegex.test(currentIframeURL);
    } else {
      throw new Error("Invalid argument " + this.stringOrRegex + " passed to assertURL. A string or regular expression is required.");
    }
  };

  return AssertURLStep;

})(Backbone.Model);

module.exports = AssertURLStep;


},{"../utils.coffee":17}],5:[function(require,module,exports){
var AssertValueStep, TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

AssertValueStep = (function(_super) {
  __extends(AssertValueStep, _super);

  function AssertValueStep(sel, expected) {
    this.sel = sel;
    this.expected = expected;
    AssertValueStep.__super__.constructor.apply(this, arguments);
  }

  AssertValueStep.prototype.mood = "look";

  AssertValueStep.prototype.announcement = function() {
    if (_(this.sel).isFunction()) {
      return "Expecting \"" + this.expected + "\" to match value of: <pre class='function'>" + this.sel + "</pre>";
    } else {
      return "Expecting \"" + this.expected + "\" to match value of: <pre>" + this.sel + "</pre>";
    }
  };

  AssertValueStep.prototype.perform = function(workspace) {
    var matched;
    if (this.$target.length !== 1) {
      return;
    }
    if (this.expected != null) {
      matched = this.$target.val().trim().toLowerCase().indexOf(this.expected.toLowerCase()) > -1;
      if (matched) {
        return this.$target;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  return AssertValueStep;

})(TargetedStep);

module.exports = AssertValueStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],6:[function(require,module,exports){
var AssertStep, TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

AssertStep = (function(_super) {
  __extends(AssertStep, _super);

  function AssertStep(sel, expected) {
    this.sel = sel;
    this.expected = expected;
    AssertStep.__super__.constructor.apply(this, arguments);
  }

  AssertStep.prototype.mood = "look";

  AssertStep.prototype.announcement = function() {
    var selClass;
    if (this.expected != null) {
      selClass = _(this.sel).isFunction() ? 'function' : '';
      return "Expecting \"" + this.expected + "\" to match contents of: <pre class='" + selClass + "''>" + this.sel + "</pre>";
    } else if (_(this.sel).isFunction()) {
      return "Performing assertion: <pre class='function'>" + this.sel + "</pre>";
    } else {
      return "Expecting element to exist: <pre>" + this.sel + "</pre>";
    }
  };

  AssertStep.prototype.getTarget = function(workspace) {
    var $page;
    if (_(this.sel).isFunction()) {
      $page = workspace.getPage();
      this.functionResult = this.sel($page);
      return this.$target = this.functionResult instanceof jQuery ? this.functionResult : $();
    } else {
      return AssertStep.__super__.getTarget.apply(this, arguments);
    }
  };

  AssertStep.prototype.perform = function(workspace) {
    var matched, value;
    if (this.$target.length === 0) {
      if (!(this.functionResult instanceof jQuery)) {
        return !!this.functionResult;
      } else {
        return false;
      }
    }
    if (this.expected != null) {
      if (this.$target.length > 1) {
        return false;
      }
      if (this.$target.is('input')) {
        value = this.$target.val();
      } else {
        value = this.$target.text();
      }
      matched = value.trim().toLowerCase().indexOf(this.expected.toLowerCase()) > -1;
      if (matched) {
        return this.$target;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  return AssertStep;

})(TargetedStep);

module.exports = AssertStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],7:[function(require,module,exports){
var ClickStep, TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

ClickStep = (function(_super) {
  __extends(ClickStep, _super);

  function ClickStep() {
    return ClickStep.__super__.constructor.apply(this, arguments);
  }

  ClickStep.prototype.mood = "click";

  ClickStep.prototype.announcement = function() {
    if (_(this.sel).isFunction()) {
      return "Clicking on: <pre class='function'>" + this.sel + "</pre>";
    } else {
      return "Clicking on: <pre>$page.find(\"" + this.sel + "\")</pre>";
    }
  };

  ClickStep.prototype.perform = function(workspace) {
    var $page;
    if (this.$target.length === 0) {
      return false;
    }
    if (this.$target.length > 1) {
      this.trigger("warning", "Warning: Can't click, multiple matches found for this selector.");
      return false;
    }
    $page = workspace.getPage();
    if ($page.find(this.$target).length !== 1) {
      return false;
    }
    utils.simulateClickOn(workspace, this.$target);
    return this.$target;
  };

  return ClickStep;

})(TargetedStep);

module.exports = ClickStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],8:[function(require,module,exports){
var CustomFunctionStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

CustomFunctionStep = (function(_super) {
  __extends(CustomFunctionStep, _super);

  function CustomFunctionStep(inFunc) {
    this.inFunc = inFunc;
    CustomFunctionStep.__super__.constructor.call(this);
  }

  CustomFunctionStep.prototype.announcement = function() {
    return "Performing custom step: <pre>" + this.inFunc + "</pre>";
  };

  CustomFunctionStep.prototype.perform = function(workspace) {
    var appWindow;
    appWindow = workspace.get("$iframe").get(0).contentWindow;
    return this.inFunc(appWindow);
  };

  return CustomFunctionStep;

})(Backbone.Model);

module.exports = CustomFunctionStep;


},{"../utils.coffee":17}],9:[function(require,module,exports){
var FocusIframeStep, TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

FocusIframeStep = (function(_super) {
  __extends(FocusIframeStep, _super);

  function FocusIframeStep() {
    return FocusIframeStep.__super__.constructor.apply(this, arguments);
  }

  FocusIframeStep.prototype.mood = "locate";

  FocusIframeStep.prototype.announcement = function() {
    if (_(this.sel).isFunction()) {
      return "Looking for iframe: <pre class='function'>" + this.sel + "</pre>";
    } else {
      return "Looking for iframe: <pre>$page.find(\"" + this.sel + "\")</pre>";
    }
  };

  FocusIframeStep.prototype.perform = function(workspace) {
    if (this.sel == null) {
      workspace.focusIframe();
      return true;
    }
    if (this.$target.length === 0) {
      return false;
    }
    if (this.$target.length > 1) {
      this.trigger("warning", "Warning: Can't focus iframe, multiple matches found for this selector.");
      return false;
    }
    workspace.focusIframe(this.$target);
    if (this.$target.contents().find('body')) {
      return this.$target;
    } else {
      return false;
    }
  };

  return FocusIframeStep;

})(TargetedStep);

module.exports = FocusIframeStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],10:[function(require,module,exports){
var PauseStep,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PauseStep = (function(_super) {
  __extends(PauseStep, _super);

  PauseStep.isPause = true;

  function PauseStep(delay) {
    this.delay = delay;
    PauseStep.__super__.constructor.call(this);
  }

  PauseStep.prototype.initialized = function() {
    this.resumed = false;
    return this.bound = false;
  };

  PauseStep.prototype.announcement = function() {
    var announcement;
    if (this.delay) {
      announcement = "Test Paused for " + this.delay + "ms.";
    } else {
      announcement = "Test Paused.";
    }
    announcement += " Run window.resume() to continue.";
    return announcement;
  };

  PauseStep.prototype.perform = function() {
    if (!this.bound) {
      window.resume = (function(_this) {
        return function() {
          return _this.resumed = true;
        };
      })(this);
      if (this.delay) {
        setTimeout(window.resume, this.delay);
      }
      this.bound = true;
    }
    return this.resumed;
  };

  return PauseStep;

})(Backbone.Model);

module.exports = PauseStep;


},{}],11:[function(require,module,exports){
var PressEnterStep, TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

PressEnterStep = (function(_super) {
  __extends(PressEnterStep, _super);

  function PressEnterStep() {
    return PressEnterStep.__super__.constructor.apply(this, arguments);
  }

  PressEnterStep.prototype.mood = "locate";

  PressEnterStep.prototype.announcement = "Pressing enter.";

  PressEnterStep.prototype.perform = function(workspace) {
    var opts;
    this.$target = utils.extractSelector(workspace, this.sel);
    if (this.$target.length !== 1) {
      return false;
    }
    opts = {
      which: 13,
      keyCode: 13
    };
    utils.eventFire(workspace, this.$target, "keydown", opts);
    utils.eventFire(workspace, this.$target, "keyup", opts);
    utils.eventFire(workspace, this.$target, "keypress", opts);
    return this.$target;
  };

  return PressEnterStep;

})(TargetedStep);

module.exports = PressEnterStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],12:[function(require,module,exports){
var TargetedStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = (function(_super) {
  __extends(TargetedStep, _super);

  function TargetedStep(sel) {
    this.sel = sel;
    TargetedStep.__super__.constructor.call(this);
  }

  TargetedStep.prototype.getTarget = function(workspace) {
    this.$target = utils.extractSelector(workspace, this.sel);
    this.set('targetElement', this.$target);
    return this.$target;
  };

  return TargetedStep;

})(Backbone.Model);

module.exports = TargetedStep;


},{"../utils.coffee":17}],13:[function(require,module,exports){
var TargetedStep, TypeStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

TargetedStep = require("../steps/targeted-step.coffee");

TypeStep = (function(_super) {
  __extends(TypeStep, _super);

  function TypeStep(sel, text) {
    this.sel = sel;
    this.text = text;
    TypeStep.__super__.constructor.apply(this, arguments);
  }

  TypeStep.prototype.mood = "locate";

  TypeStep.prototype.announcement = function() {
    return "Typing: <pre>" + this.text + "</pre>";
  };

  TypeStep.prototype.perform = function(workspace) {
    var char, opts, _i, _len, _ref;
    if (this.$target.length !== 1) {
      return false;
    }
    this.$target.focus();
    if (this.$target.val().length > 0) {
      this.$target.select();
      this.$target.val("");
    }
    _ref = this.text;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      char = _ref[_i];
      opts = {
        which: char.charCodeAt(0)
      };
      utils.eventFire(workspace, this.$target, "keydown", opts);
      this.$target.val("" + (this.$target.val()) + char);
      utils.eventFire(workspace, this.$target, "keyup", opts);
      utils.eventFire(workspace, this.$target, "keypress", opts);
    }
    utils.eventFire(workspace, this.$target, "change", opts);
    return this.$target;
  };

  return TypeStep;

})(TargetedStep);

module.exports = TypeStep;


},{"../steps/targeted-step.coffee":12,"../utils.coffee":17}],14:[function(require,module,exports){
var VisitStep, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

utils = require("../utils.coffee");

VisitStep = (function(_super) {
  __extends(VisitStep, _super);

  function VisitStep(url) {
    this.url = url;
    this.started = false;
    this.loaded = false;
    VisitStep.__super__.constructor.apply(this, arguments);
  }

  VisitStep.prototype.mood = "visit";

  VisitStep.prototype.maxRetries = 250;

  VisitStep.prototype.announcement = function() {
    return "Loading url <pre>" + this.url + "</pre>";
  };

  VisitStep.prototype.perform = function(workspace) {
    if (!this.started) {
      return this.openUrl(workspace);
    }
    return this.checkLoaded(workspace);
  };

  VisitStep.prototype.checkLoaded = function(workspace) {
    if (!this.loaded) {
      return false;
    }
    workspace.set("url", this.url);
    return true;
  };

  VisitStep.prototype.openUrl = function(workspace) {
    var $iframe;
    $iframe = workspace.getIframe();
    $iframe.attr("src", this.url);
    this.started = true;
    $iframe.load((function(_this) {
      return function() {
        return _this.loaded = true;
      };
    })(this));
    return false;
  };

  return VisitStep;

})(Backbone.Model);

module.exports = VisitStep;


},{"../utils.coffee":17}],15:[function(require,module,exports){
var AssertStep, WaitForStep,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AssertStep = require("./assert.coffee");

WaitForStep = (function(_super) {
  __extends(WaitForStep, _super);

  function WaitForStep(sel, expected, seconds) {
    this.sel = sel;
    this.expected = expected;
    this.seconds = seconds;
    this.timeExpired = __bind(this.timeExpired, this);
    WaitForStep.__super__.constructor.apply(this, arguments);
    if (typeof this.expected === 'number') {
      this.seconds = this.expected;
      this.expected = void 0;
    }
    if (this.seconds == null) {
      this.seconds = 10;
    }
    this.on('change:numFailures', (function(_this) {
      return function() {
        return _this.set('numFailures', 0);
      };
    })(this));
  }

  WaitForStep.prototype.timeExpired = function() {
    return this.timeHasExpired = true;
  };

  WaitForStep.prototype.announcement = function() {
    if (_(this.sel).isFunction()) {
      return "Waiting up to " + this.seconds + "s for: <pre class='function'>" + this.sel + "</pre>";
    } else if (this.expected != null) {
      return "Waiting up to " + this.seconds + "s for \"" + this.expected + "\" to match contents of: <pre>" + this.sel + "</pre>";
    } else {
      return "Waiting up to " + this.seconds + "s for element to exist: <pre>" + this.sel + "</pre>";
    }
  };

  WaitForStep.prototype.perform = function(workspace) {
    if (this.startTime == null) {
      this.startTime = +(new Date);
    }
    if ((+(new Date)) - this.startTime > this.seconds * 1e3) {
      throw new Error("Timeout. " + (this.announcement()));
    } else {
      return WaitForStep.__super__.perform.apply(this, arguments);
    }
  };

  return WaitForStep;

})(AssertStep);

module.exports = WaitForStep;


},{"./assert.coffee":6}],16:[function(require,module,exports){
var AssertStep, AssertURLStep, AssertValueStep, ClickStep, CustomFunctionStep, FocusIframeStep, MainView, Passer, PauseStep, PressEnterStep, Steps, TestBuilder, TypeStep, VisitStep, WaitForStep, exports;

MainView = require("./views/main-view.coffee");

Steps = require("./collections/steps.coffee");

Passer = require("./models/passer.coffee");

VisitStep = require("./steps/visit.coffee");

ClickStep = require("./steps/click.coffee");

TypeStep = require("./steps/type.coffee");

AssertStep = require("./steps/assert.coffee");

WaitForStep = require("./steps/wait-for.coffee");

AssertValueStep = require("./steps/assert-value.coffee");

AssertURLStep = require("./steps/assert-url.coffee");

PressEnterStep = require("./steps/press-enter.coffee");

CustomFunctionStep = require("./steps/custom-function.coffee");

PauseStep = require("./steps/pause.coffee");

FocusIframeStep = require("./steps/focus-iframe.coffee");

TestBuilder = (function() {
  function TestBuilder(mixins) {
    if (mixins == null) {
      mixins = {};
    }
    this.steps = new Steps();
    this.cleanupSteps = new Steps([], {
      workspace: this.steps.workspace
    });
    this.passer = new Passer({
      collection: this.steps
    });
  }

  TestBuilder.prototype.visit = function(url) {
    return this.steps.add(new VisitStep(url));
  };

  TestBuilder.prototype.click = function(sel) {
    return this.steps.add(new ClickStep(sel));
  };

  TestBuilder.prototype.locate = function(sel) {
    return this.assert(sel);
  };

  TestBuilder.prototype.type = function(sel, text) {
    this.click(sel);
    return this.steps.add(new TypeStep(sel, text));
  };

  TestBuilder.prototype.assert = function(sel, expected) {
    return this.steps.add(new AssertStep(sel, expected));
  };

  TestBuilder.prototype.waitFor = function(sel, expected) {
    return this.steps.add(new WaitForStep(sel, expected));
  };

  TestBuilder.prototype.assertValue = function(sel, expected) {
    if (expected == null) {
      throw new Error('assertValue requires an "expected" argument');
    }
    return this.steps.add(new AssertValueStep(sel, expected));
  };

  TestBuilder.prototype.assertURL = function(stringOrRegex) {
    return this.steps.add(new AssertURLStep(stringOrRegex));
  };

  TestBuilder.prototype.pressEnter = function(sel) {
    return this.steps.add(new PressEnterStep(sel));
  };

  TestBuilder.prototype.pause = function(delay) {
    return this.steps.add(new PauseStep(delay));
  };

  TestBuilder.prototype["do"] = function(inFunc) {
    return this.steps.add(new CustomFunctionStep(inFunc));
  };

  TestBuilder.prototype.cleanup = function(inFunc) {
    return this.cleanupSteps.add(new CustomFunctionStep(inFunc));
  };

  TestBuilder.prototype.run = function(mode) {
    var view, _ref, _ref1;
    if (mode == null) {
      mode = (_ref = (_ref1 = sessionStorage.integrateSpeed) != null ? _ref1 : localStorage.integrateSpeed) != null ? _ref : 'fast';
    }
    this.passer.set({
      mode: mode
    });
    view = new MainView({
      el: $("body"),
      model: this.passer
    }).render();
    this.steps.run();
    return this.steps.once('success failure', (function(_this) {
      return function() {
        view.startCleanup(_this.cleanupSteps);
        _this.steps = _this.cleanupSteps;
        return _this.cleanupSteps.run();
      };
    })(this));
  };

  TestBuilder.prototype.focusIframe = function(sel) {
    return this.steps.add(new FocusIframeStep(sel));
  };

  TestBuilder.prototype.defocusIframe = function() {
    return this.focusIframe();
  };

  return TestBuilder;

})();

window.TestBuilder = TestBuilder;

exports = TestBuilder;


},{"./collections/steps.coffee":1,"./models/passer.coffee":2,"./steps/assert-url.coffee":4,"./steps/assert-value.coffee":5,"./steps/assert.coffee":6,"./steps/click.coffee":7,"./steps/custom-function.coffee":8,"./steps/focus-iframe.coffee":9,"./steps/pause.coffee":10,"./steps/press-enter.coffee":11,"./steps/type.coffee":13,"./steps/visit.coffee":14,"./steps/wait-for.coffee":15,"./views/main-view.coffee":23}],17:[function(require,module,exports){
var eventFire, extractSelector, simulateClickOn, translateEventNameToType;

extractSelector = function(workspace, sel) {
  var $page, result;
  $page = workspace.getPage();
  if (_(sel).isFunction()) {
    result = sel($page);
    if (result instanceof jQuery) {
      return result;
    } else {
      throw new Error('Expected function to return jQuery object:', sel);
    }
  } else {
    return $page.find(sel).filter(":visible");
  }
};

eventFire = function(workspace, $el, eventName, opts) {
  var $page, el, evObj, eventType, key, val;
  if (opts == null) {
    opts = {};
  }
  eventType = translateEventNameToType(eventName);
  el = $el.get(0);
  $page = workspace.getPage();
  if (el.dispatchEvent != null) {
    evObj = $page.get(0).createEvent(eventType);
    evObj.initEvent(eventName, true, true);
    for (key in opts) {
      val = opts[key];
      evObj[key] = val;
    }
    return el.dispatchEvent(evObj);
  } else {
    return el.fireEvent("on" + eventName);
  }
};

translateEventNameToType = function(eventName) {
  if (_(["mouseenter", "mouseover", "mousedown", "mouseup", "click"]).contains(eventName)) {
    return "MouseEvents";
  }
  return "Events";
};

simulateClickOn = function(workspace, $target) {
  this.eventFire(workspace, $target, "mouseenter");
  this.eventFire(workspace, $target, "mouseover");
  this.eventFire(workspace, $target, "click");
  this.eventFire(workspace, $target, "mousedown");
  return this.eventFire(workspace, $target, "mouseup");
};

module.exports = {
  extractSelector: extractSelector,
  eventFire: eventFire,
  simulateClickOn: simulateClickOn
};


},{}],18:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class=\'current-announcement\'>\n    '+
((__t=( currentAnnouncement ))==null?'':__t)+
'\n</div>\n<div class=\'warning\'>\n</div>\n';
}
return __p;
};

},{}],19:[function(require,module,exports){
var AnnouncementView;

AnnouncementView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, "change:selected", this.render, this);
    this.listenTo(this.collection, "warning", this.showWarning, this);
  },

  template: require("./announcement.html"),

  render: function() {
    var currentAnnouncement;

    currentAnnouncement = this.getCurrentAnnouncement();
    if (currentAnnouncement === null) {
      return this;
    }

    this.$el.html(this.template({
      currentAnnouncement: currentAnnouncement
    }));

    return this;
  },

  getCurrentAnnouncement: function() {
    if (!this.collection.selected) {
      return undefined;
    }

    if (!this.collection.selected.announcement) {
      this.$el.empty();
      return undefined;
    }

    if (_.isFunction(this.collection.selected.announcement)) {
      return this.collection.selected.announcement();
    } else {
      return this.collection.selected.announcement;
    }
  },

  showWarning: function(arg) {
    this.$el.find(".warning").html(arg);
  }
});

module.exports = AnnouncementView;
},{"./announcement.html":18}],20:[function(require,module,exports){
var ControlsView, Passer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Passer = require("../models/passer.coffee");

ControlsView = (function(_super) {
  __extends(ControlsView, _super);

  function ControlsView() {
    return ControlsView.__super__.constructor.apply(this, arguments);
  }

  ControlsView.prototype.initialize = function() {
    this.render();
    this.listenTo(this.model, "change:mode", this.render);
    return this.listenTo(this.model, "change:status", this.render);
  };

  ControlsView.prototype.events = {
    "click .mode a": "_handleModeChange",
    "click .playback a": "_handlePlaybackChange"
  };

  ControlsView.prototype.template = function() {
    return "<ul>\n    <li class=\"mode integrate-control\">\n        <a href=\"#slow\" class=\"slow\" title=\"Switch to slow mode\" data-mode=\"slow\">Slow</a>\n        <a href=\"#fast\" class=\"fast\" title=\"Switch to fast mode\" data-mode=\"fast\">Fast</a>\n    </li>\n    <li class=\"playback integrate-control\">\n        <a href=\"#pause\" class=\"pause\" title=\"Pause test\" data-playback=\"pause\">\n            <span>Pause</span>\n        </a>\n        <a href=\"#play\" class=\"play\" title=\"Resume test\" data-playback=\"play\">\n            <span>Play</span>\n        </a>\n    </li>\n</ul>";
  };

  ControlsView.prototype.render = function() {
    var mode, status;
    this.$el.html(this.template);
    mode = this.model.get("mode");
    status = this.model.get("status");
    this.$("." + mode).addClass("active");
    if (status === Passer.prototype.STATUSES.RUNNING) {
      this.$(".pause").addClass("active");
    } else {
      this.$(".play").addClass("active");
    }
    if (status === Passer.prototype.STATUSES.FAIL || status === Passer.prototype.STATUSES.PASS) {
      this.$(".play").removeClass("play").addClass("restart").attr("title", "Restart test").data("playback", "restart").find("span").text("Restart").end();
    }
    return this;
  };

  ControlsView.prototype._handleModeChange = function(e) {
    var $control, mode;
    e.preventDefault();
    e.stopPropagation();
    $control = $(e.target);
    mode = $control.data("mode");
    return this.model.set("mode", mode);
  };

  ControlsView.prototype._handlePlaybackChange = function(e) {
    var $control, playback;
    e.preventDefault();
    e.stopPropagation();
    $control = $(e.target);
    playback = $control.data("playback");
    if (playback === "pause") {
      return this.model.collection.pause();
    } else if (playback === "play") {
      return window.resume();
    } else if (playback === "restart") {
      return window.location.reload();
    }
  };

  return ControlsView;

})(Backbone.View);

module.exports = ControlsView;


},{"../models/passer.coffee":2}],21:[function(require,module,exports){
var CursorView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CursorView = (function(_super) {
  __extends(CursorView, _super);

  function CursorView() {
    return CursorView.__super__.constructor.apply(this, arguments);
  }

  CursorView.prototype.initialize = function() {
    this.listenTo(this.collection, "change:selected", this.resetMood);
    this.listenTo(this.collection, "change:targetElement", this.render);
    this.listenTo(this.collection, "change:numFailures", this.render);
    return this.listenTo(this.collection, "change:speed", this.updateTransitionSpeed);
  };

  CursorView.prototype.render = function() {
    var $target, mood, _ref, _ref1;
    this.updateTransitionSpeed();
    this.resetMood();
    if (!(this.collection.selected instanceof Backbone.Model)) {
      return this;
    }
    mood = this.collection.selected.mood;
    if (mood === "visit") {
      this.showVisit();
      return this;
    }
    if (this.collection.selected.getTarget == null) {
      return this;
    }
    $target = (_ref = (_ref1 = this.collection.selected.get('targetElement')) != null ? _ref1.filter(':visible') : void 0) != null ? _ref : $();
    if ($target.length === 0) {
      if (this.collection.selected.get("numFailures") >= 5) {
        this.showConfused();
      }
      return this;
    }
    switch (mood) {
      case "locate":
        this.showLocate($target);
        break;
      case "click":
        this.showClick($target);
        break;
      case "look":
        this.showAssert($target);
    }
    return this;
  };

  CursorView.prototype.updateTransitionSpeed = function() {
    var isSlow;
    isSlow = this.collection.speed === this.collection.INTERVAL_SPEEDS.SLOW;
    return this.$el.toggleClass('slow', isSlow);
  };

  CursorView.prototype.showConfused = function() {
    var fails, left, top;
    fails = this.collection.selected.get("numFailures");
    top = ["20%", "80%"][Math.floor(fails / 40) % 2];
    left = ["20%", "80%"][Math.floor((fails + 20) / 40) % 2];
    this.$el.addClass("confused");
    return this.$el.css({
      "top": top,
      "left": left
    });
  };

  CursorView.prototype.showVisit = function() {
    var _ref;
    this.$el.show();
    this.$el.css({
      top: "49%",
      left: "49%"
    });
    this.$el.addClass("visiting");
    if ((Math.floor((_ref = this.collection.selected) != null ? _ref.get("numFailures") : void 0) % 2) === 0) {
      return this.$el.addClass("flip");
    } else {
      return this.$el.removeClass("flip");
    }
  };

  CursorView.prototype.showLocate = function($item) {
    var currentIframe, horizontalAdjust, nestedOffset, offset, verticalAdjust;
    if ($item.length !== 1) {
      return;
    }
    currentIframe = this.collection.workspace.get("$iframe");
    verticalAdjust = 115;
    horizontalAdjust = 5;
    if (currentIframe.get(0) !== $("iframe").get(0)) {
      nestedOffset = currentIframe.offset();
      verticalAdjust += nestedOffset.top;
      horizontalAdjust += nestedOffset.left;
    }
    offset = $item.offset();
    return this.$el.show().css({
      top: offset.top + verticalAdjust + ($item.outerHeight() / 2),
      left: offset.left + horizontalAdjust + ($item.outerWidth() / 2)
    });
  };

  CursorView.prototype.showClick = function($item) {
    this.showLocate($item);
    this.$el.addClass("click-viz-before-mouse-down");
    return setTimeout((function(_this) {
      return function() {
        return _this.$el.removeClass("click-viz-before-mouse-down").addClass("click-viz-mouse-down");
      };
    })(this), this.collection.speed - 150);
  };

  CursorView.prototype.showAssert = function($item) {
    this.$el.addClass("looking");
    return this.showLocate($item);
  };

  CursorView.prototype.resetMood = function() {
    return this.$el.removeClass("click-viz-mouse-down").removeClass("looking").removeClass("confused").removeClass("visiting");
  };

  return CursorView;

})(Backbone.View);

module.exports = CursorView;


},{}],22:[function(require,module,exports){
var GradeView, Passer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Passer = require("../models/passer.coffee");

GradeView = (function(_super) {
  __extends(GradeView, _super);

  function GradeView() {
    return GradeView.__super__.constructor.apply(this, arguments);
  }

  GradeView.prototype.initialize = function() {
    this.render();
    return this.listenTo(this.model, "change", (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  GradeView.prototype.render = function() {
    var errorMessage, status, _ref;
    if (this.model.get("status") === Passer.prototype.STATUSES.PASS) {
      this.revealStatus("Test Passed.");
      this.reportStatus("integrate-test-passed");
      this.setColor("#00B968");
    }
    if (this.model.get("status") === Passer.prototype.STATUSES.FAIL) {
      errorMessage = (_ref = this.model.collection) != null ? _ref.errorMessage : void 0;
      status = "Test Failed.";
      if (errorMessage != null) {
        status = "Uncaught exception: " + errorMessage;
      }
      this.revealStatus(status);
      this.reportStatus("integrate-test-failed");
      this.setColor("rgb(248, 22, 58)");
    }
    if (this.model.get("status") === Passer.prototype.STATUSES.WARN) {
      this.revealStatus("This step is taking a long time.");
      this.setColor("rgb(204, 204, 0)");
    }
    if (this.model.get("status") === Passer.prototype.STATUSES.RUNNING) {
      this.$el.slideUp();
    }
    return this;
  };

  GradeView.prototype.reportStatus = function(className) {
    return $("body").append("<div id='integrate-test-result' class='" + className + "' style='display: none'></div>");
  };

  GradeView.prototype.revealStatus = function(status) {
    return this.$el.text(status).slideDown();
  };

  GradeView.prototype.clearStatus = function(status) {
    return this.$el.slideUp();
  };

  GradeView.prototype.setColor = function(colorStr) {
    return $("body").css("background-color", colorStr);
  };

  return GradeView;

})(Backbone.View);

module.exports = GradeView;


},{"../models/passer.coffee":2}],23:[function(require,module,exports){
var AnnouncementView, ControlsView, CursorView, GradeView, MainView, ProgressView, RetriesView, URLView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AnnouncementView = require("./announcement.js");

URLView = require("./url.coffee");

ProgressView = require("./progress.coffee");

RetriesView = require("./retries.coffee");

GradeView = require("./grade.coffee");

CursorView = require("./cursor.coffee");

ControlsView = require("./controls.coffee");

MainView = (function(_super) {
  __extends(MainView, _super);

  function MainView() {
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.template = function() {
    return "<iframe id=\"integrate-workspace\"></iframe>\n<div id=\"integrate-announce\">\n    <div id=\"integrate-status\" style=\"\"></div>\n    <div id=\"integrate-current-step\">\n        <div class=\"current-announcement\">\n        </div>\n        <div class=\"warning\"></div>\n    </div>\n    <div id=\"integrate-countdown\">\n        <span class=\"num\"></span><span> retries until failure</span>\n    </div>\n    <div id=\"integrate-progress-outer\">\n        <div id=\"integrate-progress-inner\"></div>\n    </div>\n    <div id=\"integrate-url\"></div>\n    <div id=\"integrate-controls\"><ul>\n        <li class=\"mode integrate-control\">\n            <a href=\"#slow\" class=\"slow\" title=\"Switch to slow mode\" data-mode=\"slow\">Slow</a>\n            <a href=\"#fast\" class=\"fast active\" title=\"Switch to fast mode\" data-mode=\"fast\">Fast</a>\n        </li>\n        <li class=\"playback integrate-control\">\n            <a href=\"#pause\" class=\"pause active\" title=\"Pause test\" data-playback=\"pause\">\n                <span>Pause</span>\n            </a>\n            <a href=\"#play\" class=\"play\" title=\"Resume test\" data-playback=\"play\">\n                <span>Play</span>\n            </a>\n        </li>\n    </ul></div>\n</div>\n<div id=\"integrate-click-viz\" class=\"confused\" style=\"display: block; top: 20%; left: 80%;\">?</div>";
  };

  MainView.prototype.render = function() {
    var passer, steps;
    this.$el.prepend(this.template());
    passer = this.model;
    steps = passer.collection;
    new AnnouncementView({
      collection: steps,
      el: this.$("#integrate-current-step")
    });
    new URLView({
      model: steps.workspace,
      el: this.$("#integrate-url")
    });
    new ProgressView({
      collection: steps,
      el: this.$("#integrate-progress-inner")
    });
    new RetriesView({
      model: passer,
      el: this.$("#integrate-countdown")
    });
    new GradeView({
      model: passer,
      el: this.$("#integrate-status")
    });
    new CursorView({
      collection: steps,
      el: this.$("#integrate-click-viz")
    });
    new ControlsView({
      model: passer,
      el: this.$("#integrate-controls")
    });
    return this;
  };

  MainView.prototype.startCleanup = function(cleanupSteps) {
    new CursorView({
      collection: cleanupSteps,
      el: this.$("#integrate-click-viz")
    });
    this.$('#integrate-announce').append("<div id='integrate-test-cleanup'>Performing cleanup&hellip;</div>");
    return cleanupSteps.once('success failure', (function(_this) {
      return function() {
        return $('#integrate-test-cleanup').remove();
      };
    })(this));
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;


},{"./announcement.js":19,"./controls.coffee":20,"./cursor.coffee":21,"./grade.coffee":22,"./progress.coffee":24,"./retries.coffee":25,"./url.coffee":26}],24:[function(require,module,exports){
var ProgressView, Steps,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Steps = require("../collections/steps.coffee");

ProgressView = (function(_super) {
  __extends(ProgressView, _super);

  function ProgressView() {
    return ProgressView.__super__.constructor.apply(this, arguments);
  }

  ProgressView.prototype.initialize = function() {
    this.render();
    return this.listenTo(this.collection, "change:selected", (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  ProgressView.prototype.render = function() {
    var index, width;
    if (this.collection.selected == null) {
      this.$el.css('width', '0%');
      return this;
    }
    if (this.collection.selected === Steps.prototype.END) {
      width = 100;
    } else {
      index = this.collection.indexOf(this.collection.selected);
      width = (index / this.collection.size()) * 100;
    }
    this.$el.css('width', "" + width + "%");
    this.$el.data('percent_done', width);
    return this;
  };

  return ProgressView;

})(Backbone.View);

module.exports = ProgressView;


},{"../collections/steps.coffee":1}],25:[function(require,module,exports){
var Passer, RetriesView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Passer = require("../models/passer.coffee");

RetriesView = (function(_super) {
  __extends(RetriesView, _super);

  function RetriesView() {
    return RetriesView.__super__.constructor.apply(this, arguments);
  }

  RetriesView.prototype.initialize = function() {
    this.render();
    return this.listenTo(this.model, "change", (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  RetriesView.prototype.render = function() {
    var status;
    status = Passer.prototype.STATUSES;
    if (_([status.FAIL, status.PASS]).contains(this.model.get('status'))) {
      this.$el.slideUp();
      return;
    }
    this.$(".num").text(this.model.get("retriesRemaining"));
    return this;
  };

  return RetriesView;

})(Backbone.View);

module.exports = RetriesView;


},{"../models/passer.coffee":2}],26:[function(require,module,exports){
var URLView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

URLView = (function(_super) {
  __extends(URLView, _super);

  function URLView() {
    return URLView.__super__.constructor.apply(this, arguments);
  }

  URLView.prototype.initialize = function() {
    this.render();
    return this.listenTo(this.model, "change:url", (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  URLView.prototype.render = function() {
    this.$el.html("<a href=\"" + (this.model.get("url")) + "\" target=\"_blank\">" + (this.model.get("url")) + "</a>");
    return this;
  };

  return URLView;

})(Backbone.View);

module.exports = URLView;


},{}]},{},[16])