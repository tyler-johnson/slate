'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _xor = require('lodash/xor');

var _xor2 = _interopRequireDefault(_xor);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Snapshot, with a state-like shape.
 */

var Snapshot = new _immutable.Record({
  document: null,
  selection: null,
  steps: new _immutable.List()
});

/**
 * Step.
 */

var Step = new _immutable.Record({
  type: null,
  args: null
});

/**
 * Document range transforms.
 */

var DOCUMENT_RANGE_TRANSFORMS = ['deleteAtRange', 'deleteBackwardAtRange', 'deleteForwardAtRange', 'insertBlockAtRange', 'insertFragmentAtRange', 'insertInlineAtRange', 'insertTextAtRange', 'addMarkAtRange', 'setBlockAtRange', 'setInlineAtRange', 'splitBlockAtRange', 'splitInlineAtRange', 'removeMarkAtRange', 'toggleMarkAtRange', 'unwrapBlockAtRange', 'unwrapInlineAtRange', 'wrapBlockAtRange', 'wrapInlineAtRange'];

/**
 * Document node transforms.
 */

var DOCUMENT_NODE_TRANSFORMS = ['removeNodeByKey', 'setNodeByKey'];

/**
 * Selection transforms.
 */

var SELECTION_TRANSFORMS = ['blur', 'collapseToAnchor', 'collapseToEnd', 'collapseToEndOf', 'collapseToFocus', 'collapseToStart', 'collapseToStartOf', 'extendBackward', 'extendForward', 'extendToEndOf', 'extendToStartOf', 'focus', 'moveBackward', 'moveForward', 'moveToOffsets', 'moveToRangeOf'];

/**
 * State-level document transforms.
 */

var STATE_DOCUMENT_TRANSFORMS = ['delete', 'deleteBackward', 'deleteForward', 'insertBlock', 'insertFragment', 'insertInline', 'insertText', 'addMark', 'setBlock', 'setInline', 'splitBlock', 'splitInline', 'removeMark', 'toggleMark', 'unwrapBlock', 'unwrapInline', 'wrapBlock', 'wrapInline'];

/**
 * State selection transforms.
 */

var STATE_SELECTION_TRANSFORMS = ['collapseToEndOfNextBlock', 'collapseToEndOfNextText', 'collapseToEndOfPreviousBlock', 'collapseToEndOfPreviousText', 'collapseToStartOfNextBlock', 'collapseToStartOfNextText', 'collapseToStartOfPreviousBlock', 'collapseToStartOfPreviousText', 'moveTo'];

/**
 * All state-level transforms.
 */

var STATE_TRANSFORMS = [].concat(STATE_DOCUMENT_TRANSFORMS).concat(STATE_SELECTION_TRANSFORMS);

/**
 * All transforms.
 */

var TRANSFORMS = [].concat(DOCUMENT_RANGE_TRANSFORMS).concat(DOCUMENT_NODE_TRANSFORMS).concat(SELECTION_TRANSFORMS).concat(STATE_TRANSFORMS);

/**
 * Defaults.
 */

var DEFAULT_PROPERTIES = {
  manager: null,
  steps: new _immutable.List()
};

/**
 * Transform.
 */

var Transform = function (_ref) {
  _inherits(Transform, _ref);

  function Transform() {
    _classCallCheck(this, Transform);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Transform).apply(this, arguments));
  }

  _createClass(Transform, [{
    key: 'apply',


    /**
     * Apply the transform and return the new state.
     *
     * @param {Object} options
     *   @property {Boolean} isNative
     *   @property {Boolean} snapshot
     * @return {State} state
     */

    value: function apply() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var transform = this;
      var state = transform.state;
      var steps = transform.steps;
      var _state = state;
      var cursorMarks = _state.cursorMarks;
      var history = _state.history;
      var selection = _state.selection;
      var _history = history;
      var undos = _history.undos;
      var redos = _history.redos;

      // Determine whether we need to create a new snapshot.

      var shouldSnapshot = options.snapshot == null ? this.shouldSnapshot() : options.snapshot;

      // If we should, save a snapshot into the history before transforming.
      if (shouldSnapshot) {
        var snapshot = transform.snapshot();
        undos = undos.push(snapshot);
        if (undos.size > 100) undos = undos.take(100);
        redos = redos.clear();
        history = history.merge({ undos: undos, redos: redos });
        state = state.merge({ history: history });
      }

      // Apply each of the steps in the transform, arriving at a new state.
      state = steps.reduce(function (memo, step) {
        return _this2.applyStep(memo, step);
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

      return state;
    }

    /**
     * Apply a single `step` to a `state`, differentiating between types.
     *
     * @param {State} state
     * @param {Step} step
     * @return {State} state
     */

  }, {
    key: 'applyStep',
    value: function applyStep(state, step) {
      var type = step.type;
      var args = step.args;


      if ((0, _includes2.default)(DOCUMENT_RANGE_TRANSFORMS, type)) {
        var _document;

        var _state2 = state;
        var document = _state2.document;
        var selection = _state2.selection;

        var _args = _toArray(args);

        var range = _args[0];

        var rest = _args.slice(1);

        range = range.normalize(document);
        document = (_document = document)[type].apply(_document, [range].concat(_toConsumableArray(rest)));
        selection = selection.normalize(document);
        state = state.merge({ document: document, selection: selection });
        return state;
      } else if ((0, _includes2.default)(DOCUMENT_NODE_TRANSFORMS, type)) {
        var _document3;

        var _state3 = state;
        var _document2 = _state3.document;
        var _selection = _state3.selection;

        _document2 = (_document3 = _document2)[type].apply(_document3, _toConsumableArray(args));
        _selection = _selection.normalize(_document2);
        state = state.merge({ document: _document2, selection: _selection });
        return state;
      } else if ((0, _includes2.default)(SELECTION_TRANSFORMS, type)) {
        var _selection3;

        var _state4 = state;
        var _document4 = _state4.document;
        var _selection2 = _state4.selection;

        _selection2 = (_selection3 = _selection2)[type].apply(_selection3, _toConsumableArray(args));
        _selection2 = _selection2.normalize(_document4);
        state = state.merge({ selection: _selection2 });
        return state;
      } else if ((0, _includes2.default)(STATE_TRANSFORMS, type)) {
        var _state5;

        state = (_state5 = state)[type].apply(_state5, _toConsumableArray(args));
        return state;
      }
    }

    /**
     * Check whether the current transform steps should create a snapshot.
     *
     * @return {Boolean}
     */

  }, {
    key: 'shouldSnapshot',
    value: function shouldSnapshot() {
      var transform = this;
      var state = transform.state;
      var steps = transform.steps;
      var cursorMarks = state.cursorMarks;
      var history = state.history;
      var selection = state.selection;
      var undos = history.undos;
      var redos = history.redos;

      var previous = undos.peek();

      // If the only steps applied are selection transforms, don't snapshot.
      var onlySelections = steps.every(function (step) {
        return (0, _includes2.default)(SELECTION_TRANSFORMS, step.type) || (0, _includes2.default)(STATE_SELECTION_TRANSFORMS, step.type);
      });

      if (onlySelections) return false;

      // If there isn't a previous state, snapshot.
      if (!previous) return true;

      // If there is a previous state but the steps are different, snapshot.
      var types = steps.map(function (step) {
        return step.type;
      });
      var prevTypes = previous.steps.map(function (step) {
        return step.type;
      });
      var diff = (0, _xor2.default)(types.toArray(), prevTypes.toArray());
      if (diff.length) return true;

      // If the current steps aren't one of the "combinable" types, snapshot.
      var allCombinable = steps.every(function (step) {
        return step.type == 'insertText';
      }) || steps.every(function (step) {
        return step.type == 'deleteForward';
      }) || steps.every(function (step) {
        return step.type == 'deleteBackward';
      });

      if (!allCombinable) return true;

      // Otherwise, don't snapshot.
      return false;
    }

    /**
     * Create a history-ready snapshot of the current state.
     *
     * @return {Snapshot} snapshot
     */

  }, {
    key: 'snapshot',
    value: function snapshot() {
      var state = this.state;
      var steps = this.steps;
      var document = state.document;
      var selection = state.selection;

      return new Snapshot({ document: document, selection: selection, steps: steps });
    }

    /**
     * Undo to the previous state in the history.
     *
     * @return {State} state
     */

  }, {
    key: 'undo',
    value: function undo() {
      var transform = this;
      var state = transform.state;
      var _state6 = state;
      var history = _state6.history;
      var _history2 = history;
      var undos = _history2.undos;
      var redos = _history2.redos;

      // If there's no previous snapshot, return the current state.

      var previous = undos.peek();
      if (!previous) return state;

      // Remove the previous snapshot from the undo stack.
      undos = undos.pop();

      // Snapshot the current state, and move it into the redos stack.
      var snapshot = transform.snapshot();
      redos = redos.push(snapshot);

      // Return the previous state, with the updated history.
      var document = previous.document;
      var selection = previous.selection;

      history = history.merge({ undos: undos, redos: redos });
      state = state.merge({
        document: document,
        selection: selection,
        history: history,
        isNative: false
      });

      return state;
    }

    /**
     * Redo to the next state in the history.
     *
     * @return {State} state
     */

  }, {
    key: 'redo',
    value: function redo() {
      var transform = this;
      var state = transform.state;
      var _state7 = state;
      var history = _state7.history;
      var _history3 = history;
      var undos = _history3.undos;
      var redos = _history3.redos;

      // If there's no next snapshot, return the current state.

      var next = redos.peek();
      if (!next) return state;

      // Remove the next history from the redo stack.
      redos = redos.pop();

      // Snapshot the current state, and move it into the undos stack.
      var snapshot = transform.snapshot();
      undos = undos.push(snapshot);

      // Return the next state, with the updated history.
      var document = next.document;
      var selection = next.selection;

      history = history.merge({ undos: undos, redos: redos });
      state = state.merge({
        document: document,
        selection: selection,
        history: history,
        isNative: false
      });

      return state;
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'transform';
    }
  }]);

  return Transform;
}(new _immutable.Record(DEFAULT_PROPERTIES));

/**
 * Add a step-creating method for each of the transforms.
 */

TRANSFORMS.forEach(function (type) {
  Transform.prototype[type] = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var transform = this;
    var _transform = transform;
    var steps = _transform.steps;

    steps = steps.push(new Step({ type: type, args: args }));
    transform = transform.merge({ steps: steps });
    return transform;
  };
});

/**
 * Export.
 */

exports.default = Transform;