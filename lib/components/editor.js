'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _content = require('./content');

var _content2 = _interopRequireDefault(_content);

var _core = require('../plugins/core');

var _core2 = _interopRequireDefault(_core);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _schema3 = require('../models/schema');

var _schema4 = _interopRequireDefault(_schema3);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

var _isReactComponent = require('../utils/is-react-component');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 */

var debug = (0, _debug2.default)('slate:editor');

/**
 * Noop.
 *
 * @type {Function}
 */

function noop() {}

/**
 * Event handlers to mix in to the editor.
 *
 * @type {Array}
 */

var EVENT_HANDLERS = ['onBeforeInput', 'onBlur', 'onCopy', 'onCut', 'onDrop', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Editor.
 *
 * @type {Component}
 */

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  /**
   * When created, compute the plugins from `props`.
   *
   * @param {Object} props
   */

  /**
   * Properties.
   */

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _initialiseProps.call(_this);

    _this.tmp = {};
    _this.state = {};
    _this.state.plugins = _this.resolvePlugins(props);
    _this.state.schema = _this.resolveSchema(_this.state.plugins);
    _this.state.state = _this.onBeforeChange(props.state);

    // Mix in the event handlers.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var method = _step.value;

        _this[method] = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this.onEvent.apply(_this, [method].concat(args));
        };
      };

      for (var _iterator = EVENT_HANDLERS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return _this;
  }

  /**
   * When the `props` are updated, recompute the state and plugins.
   *
   * @param {Object} props
   */

  /**
   * Default properties.
   */

  /**
   * Programmatically blur the editor.
   */

  /**
   * Programmatically focus the editor.
   */

  /**
   * Get the editor's current `schema`.
   *
   * @return {Schema}
   */

  /**
   * Get the editor's current `state`.
   *
   * @return {State}
   */

  /**
   * When the editor receives a new 'state'
   *
   * @param {State} state
   * @return {State} newState
   */

  /**
   * When the `state` changes, pass through plugins, then bubble up.
   *
   * @param {State} state
   */

  /**
   * When an event by `name` fires, pass it through the plugins, and update the
   * state if one of them chooses to.
   *
   * @param {String} name
   * @param {Mixed} ...args
   */

  /**
   * Render the editor.
   *
   * @return {Element}
   */

  /**
   * Resolve the editor's current plugins from `props` when they change.
   *
   * Add a plugin made from the editor's own `props` at the beginning of the
   * stack. That way, you can add a `onKeyDown` handler to the editor itself,
   * and it will override all of the existing plugins.
   *
   * Also add the "core" functionality plugin that handles the most basic events
   * for the editor, like delete characters and such.
   *
   * @param {Object} props
   * @return {Array}
   */

  /**
   * Resolve the editor's schema from a set of `plugins`.
   *
   * @param {Array} plugins
   * @return {Schema}
   */

  return Editor;
}(_react2.default.Component);

/**
 * Mix in the property types for the event handlers.
 */

Editor.propTypes = {
  className: _react2.default.PropTypes.string,
  onBeforeChange: _react2.default.PropTypes.func,
  onChange: _react2.default.PropTypes.func,
  onDocumentChange: _react2.default.PropTypes.func,
  onSelectionChange: _react2.default.PropTypes.func,
  placeholder: _react2.default.PropTypes.any,
  placeholderClassName: _react2.default.PropTypes.string,
  placeholderStyle: _react2.default.PropTypes.object,
  plugins: _react2.default.PropTypes.array,
  readOnly: _react2.default.PropTypes.bool,
  schema: _react2.default.PropTypes.object,
  spellCheck: _react2.default.PropTypes.bool,
  state: _react2.default.PropTypes.object.isRequired,
  style: _react2.default.PropTypes.object
};
Editor.defaultProps = {
  onChange: noop,
  onDocumentChange: noop,
  onSelectionChange: noop,
  plugins: [],
  readOnly: false,
  schema: {},
  spellCheck: true
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.componentWillReceiveProps = function (props) {
    if (props.plugins != _this2.props.plugins) {
      var plugins = _this2.resolvePlugins(props);
      var schema = _this2.resolveSchema(plugins);
      _this2.setState({ plugins: plugins, schema: schema });
    } else if (props.schema != _this2.props.schema) {
      var _schema = _this2.resolveSchema(_this2.state.plugins);
      _this2.setState({ schema: _schema });
    }

    _this2.setState({
      state: _this2.onBeforeChange(props.state)
    });
  };

  this.blur = function () {
    var state = _this2.state.state.transform().blur().apply();

    _this2.onChange(state);
  };

  this.focus = function () {
    var state = _this2.state.state.transform().focus().apply();

    _this2.onChange(state);
  };

  this.getSchema = function () {
    return _this2.state.schema;
  };

  this.getState = function () {
    return _this2.state.state;
  };

  this.onBeforeChange = function (state) {
    if (state == _this2.state.state) return state;

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = _this2.state.plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var plugin = _step3.value;

        if (!plugin.onBeforeChange) continue;
        var newState = plugin.onBeforeChange(state, _this2);
        if (newState == null) continue;
        state = newState;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return state;
  };

  this.onChange = function (state) {
    if (state == _this2.state.state) return;

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = _this2.state.plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var plugin = _step4.value;

        if (!plugin.onChange) continue;
        var newState = plugin.onChange(state, _this2);
        if (newState == null) continue;
        state = newState;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    _this2.props.onChange(state);

    if (state.document != _this2.tmp.document) {
      _this2.props.onDocumentChange(state.document, state);
      _this2.tmp.document = state.document;
    }

    if (state.selection != _this2.tmp.selection) {
      _this2.props.onSelectionChange(state.selection, state);
      _this2.tmp.selection = state.selection;
    }
  };

  this.onEvent = function (name) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = _this2.state.plugins[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var plugin = _step5.value;

        if (!plugin[name]) continue;
        var newState = plugin[name].apply(plugin, args.concat([_this2.state.state, _this2]));
        if (!newState) continue;
        _this2.onChange(newState);
        break;
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  };

  this.render = function () {
    debug('render');

    var handlers = {};

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = EVENT_HANDLERS[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var property = _step6.value;

        handlers[property] = _this2[property];
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }

    return _react2.default.createElement(_content2.default, _extends({}, handlers, {
      className: _this2.props.className,
      editor: _this2,
      onChange: _this2.onChange,
      readOnly: _this2.props.readOnly,
      schema: _this2.state.schema,
      spellCheck: _this2.props.spellCheck,
      state: _this2.state.state,
      style: _this2.props.style
    }));
  };

  this.resolvePlugins = function (props) {
    var onChange = props.onChange;
    var plugins = props.plugins;

    var editorPlugin = _objectWithoutProperties(props, ['onChange', 'plugins']);

    var corePlugin = (0, _core2.default)(props);
    return [editorPlugin].concat(_toConsumableArray(plugins), [corePlugin]);
  };

  this.resolveSchema = function (plugins) {
    var rules = [];

    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = plugins[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var plugin = _step7.value;

        if (!plugin.schema) continue;
        var _schema2 = _schema4.default.create(plugin.schema);
        rules = rules.concat(_schema2.rules);
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    var schema = _schema4.default.create({ rules: rules });
    return schema;
  };
};

var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  for (var _iterator2 = EVENT_HANDLERS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    var property = _step2.value;

    Editor.propTypes[property] = _react2.default.PropTypes.func;
  }

  /**
   * Export.
   */
} catch (err) {
  _didIteratorError2 = true;
  _iteratorError2 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion2 && _iterator2.return) {
      _iterator2.return();
    }
  } finally {
    if (_didIteratorError2) {
      throw _iteratorError2;
    }
  }
}

exports.default = Editor;