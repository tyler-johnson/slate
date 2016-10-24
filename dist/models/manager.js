'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ACTIONS = undefined;

var _Manager$actions;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redux = require('redux');

var _immutable = require('immutable');

var _state2 = require('./state');

var _state3 = _interopRequireDefault(_state2);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ACTIONS = exports.ACTIONS = {
  TRANSFORM: "transform",
  ADD_STATE: "add-state"
};

var History = new _immutable.Record({
  undos: new _immutable.Stack(),
  redos: new _immutable.Stack()
});

var Container = new _immutable.Record({
  states: new _immutable.Map(),
  history: new History()
});

var Snapshot = new _immutable.Record({
  document: null,
  selection: null,
  steps: new _immutable.List()
});

function createSnapshot(state, steps) {
  var document = state.document;
  var selection = state.selection;

  return new Snapshot({ document: document, selection: selection, steps: steps });
}

var Manager = function () {
  function Manager(initial) {
    _classCallCheck(this, Manager);

    this.store = (0, _redux.createStore)(this._reducer, initial);
  }

  _createClass(Manager, [{
    key: '_reducer',
    value: function _reducer() {
      var container = arguments.length <= 0 || arguments[0] === undefined ? new Container() : arguments[0];
      var action = arguments[1];

      if (typeof Manager.actions[action.type] === "function") {
        return Manager.actions[action.type](container, action);
      } else {
        return container;
      }
    }
  }, {
    key: 'getState',
    value: function getState(key) {
      return this.states.get(key);
    }
  }, {
    key: 'createState',
    value: function createState() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var state = _state3.default.create(props);
      var type = ACTIONS.ADD_STATE;
      this.store.dispatch({ type: type, state: state });
      return state;
    }
  }, {
    key: 'getOrCreateState',
    value: function getOrCreateState(key) {
      var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      key = props.key = key || props.key || (0, _uid2.default)();
      var state = this.getState(key);
      if (state == null) state = this.createState(props);
      return state;
    }
  }, {
    key: 'transform',
    value: function transform() {
      return new _transform2.default({ manager: this });
    }
  }, {
    key: 'states',
    get: function get() {
      return this.store.getState().states;
    }
  }, {
    key: 'history',
    get: function get() {
      return this.store.getState().history;
    }
  }], [{
    key: 'create',
    value: function create() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (props instanceof Manager) return props;
      props.states = new _immutable.Map(props.states);
      return new Manager(props);
    }
  }]);

  return Manager;
}();

Manager.actions = (_Manager$actions = {}, _defineProperty(_Manager$actions, Manager.TRANSFORM, function transform(container, _ref) {
  var _this = this;

  var state = _ref.state;
  var steps = _ref.steps;
  var _ref$options = _ref.options;
  var options = _ref$options === undefined ? {} : _ref$options;
  var _container = container;
  var history = _container.history;
  var states = _container.states;
  var _state = state;
  var cursorMarks = _state.cursorMarks;
  var selection = _state.selection;
  var _history = history;
  var undos = _history.undos;
  var redos = _history.redos;

  // Determine whether we need to create a new snapshot.

  var shouldSnapshot = options.snapshot == null ? this.shouldSnapshot() : options.snapshot;

  // If we should, save a snapshot into the history before transforming.
  if (shouldSnapshot) {
    var snapshot = createSnapshot(state, steps);
    undos = undos.push(snapshot);
    if (undos.size > 100) undos = undos.take(100);
    redos = redos.clear();
    history = history.merge({ undos: undos, redos: redos });
  }

  // Apply each of the steps in the transform, arriving at a new state.
  state = steps.reduce(function (memo, step) {
    return _this.applyStep(memo, step);
  }, state);

  // If the selection has changed, clear any existing cursor marks.
  if (state.selection != selection) {
    state = state.merge({
      cursorMarks: null
    });
  }

  // Apply the "isNative" flag, which is used to allow for natively-handled
  // content changes to skip rerendering the editor for performance.
  state = state.merge({
    isNative: !!options.isNative
  });

  states = states.set(state.key, state);
  container = container.merge({ states: states, history: history });
  return container;
}), _defineProperty(_Manager$actions, Manager.ADD_STATE, function addState(container, _ref2) {
  var state = _ref2.state;
  var states = container.states;

  states = states.set(state.key, state);
  return container.merge({ states: states });
}), _Manager$actions);

exports.default = Manager;