'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _transfer = require('../utils/transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:content');

/**
 * Noop.
 *
 * @type {Function}
 */

function noop() {}

/**
 * Content.
 *
 * @type {Component}
 */

var Content = function (_React$Component) {
  _inherits(Content, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Content(props) {
    _classCallCheck(this, Content);

    var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

    _initialiseProps.call(_this);

    _this.tmp = {};
    _this.tmp.compositions = 0;
    _this.forces = 0;
    return _this;
  }

  /**
   * Should the component update?
   *
   * @param {Object} props
   * @param {Object} state
   * @return {Boolean} shouldUpdate
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * While rendering, set the `isRendering` flag.
   *
   * @param {Object} props
   * @param {Object} state
   */

  /**
   * When finished rendering, move the `isRendering` flag on next tick.
   *
   * @param {Object} props
   * @param {Object} state
   */

  _createClass(Content, [{
    key: 'getPoint',


    /**
     * Get a point from a native selection's DOM `element` and `offset`.
     *
     * @param {Element} element
     * @param {Number} offset
     * @return {Object}
     */

    value: function getPoint(element, offset) {
      var _props = this.props;
      var state = _props.state;
      var editor = _props.editor;
      var document = state.document;

      var schema = editor.getSchema();
      var offsetKey = _offsetKey2.default.findKey(element, offset);
      var key = offsetKey.key;

      var node = document.getDescendant(key);
      var decorators = document.getDescendantDecorators(key, schema);
      var ranges = node.getRanges(decorators);
      var point = _offsetKey2.default.findPoint(offsetKey, ranges);
      return point;
    }

    /**
     * On before input, bubble up.
     *
     * @param {Event} e
     */

    /**
     * On blur, update the selection to be not focused.
     *
     * @param {Event} e
     */

    /**
     * On change, bubble up.
     *
     * @param {State} state
     */

    /**
     * On composition start, set the `isComposing` flag.
     *
     * @param {Event} e
     */

    /**
     * On composition end, remove the `isComposing` flag on the next tick. Also
     * increment the `forces` key, which will force the contenteditable element
     * to completely re-render, since IME puts React in an unreconcilable state.
     *
     * @param {Event} e
     */

    /**
     * On copy, defer to `onCutCopy`, then bubble up.
     *
     * @param {Event} e
     */

    /**
     * On cut, defer to `onCutCopy`, then bubble up.
     *
     * @param {Event} e
     */

    /**
     * On drag end, unset the `isDragging` flag.
     *
     * @param {Event} e
     */

    /**
     * On drag over, set the `isDragging` flag and the `isInternalDrag` flag.
     *
     * @param {Event} e
     */

    /**
     * On drag start, set the `isDragging` flag and the `isInternalDrag` flag.
     *
     * @param {Event} e
     */

    /**
     * On drop.
     *
     * @param {Event} e
     */

    /**
     * On input, handle spellcheck and other similar edits that don't go trigger
     * the `onBeforeInput` and instead update the DOM directly.
     *
     * @param {Event} e
     */

    /**
     * On key down, prevent the default behavior of certain commands that will
     * leave the editor in an out-of-sync state, then bubble up.
     *
     * @param {Event} e
     */

    /**
     * On paste, determine the type and bubble up.
     *
     * @param {Event} e
     */

    /**
     * On select, update the current state's selection.
     *
     * @param {Event} e
     */

    /**
     * Render the editor content.
     *
     * @return {Element} element
     */

    /**
     * Render a `node`.
     *
     * @param {Node} node
     * @return {Element} element
     */

  }]);

  return Content;
}(_react2.default.Component);

/**
 * Check if an `event` is being fired from inside a non-contentediable child
 * element, in which case we'll want to ignore it.
 *
 * @param {Event} event
 * @return {Boolean}
 */

Content.propTypes = {
  className: _react2.default.PropTypes.string,
  editor: _react2.default.PropTypes.object.isRequired,
  onBeforeInput: _react2.default.PropTypes.func.isRequired,
  onBlur: _react2.default.PropTypes.func.isRequired,
  onChange: _react2.default.PropTypes.func.isRequired,
  onCopy: _react2.default.PropTypes.func.isRequired,
  onCut: _react2.default.PropTypes.func.isRequired,
  onDrop: _react2.default.PropTypes.func.isRequired,
  onKeyDown: _react2.default.PropTypes.func.isRequired,
  onPaste: _react2.default.PropTypes.func.isRequired,
  onSelect: _react2.default.PropTypes.func.isRequired,
  readOnly: _react2.default.PropTypes.bool.isRequired,
  schema: _react2.default.PropTypes.object,
  spellCheck: _react2.default.PropTypes.bool.isRequired,
  state: _react2.default.PropTypes.object.isRequired,
  style: _react2.default.PropTypes.object
};
Content.defaultProps = {
  style: {}
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.shouldComponentUpdate = function (props, state) {
    // If the readOnly state has changed, we need to re-render so that
    // the cursor will be added or removed again.
    if (props.readOnly != _this2.props.readOnly) return true;

    // If the state has been transformed natively, never re-render, or else we
    // will end up duplicating content.
    if (props.state.isNative) return false;

    return props.className != _this2.props.className || props.schema != _this2.props.schema || props.spellCheck != _this2.props.spellCheck || props.state != _this2.props.state || props.style != _this2.props.style;
  };

  this.componentWillUpdate = function (props, state) {
    _this2.tmp.isRendering = true;
  };

  this.componentDidUpdate = function (props, state) {
    setTimeout(function () {
      _this2.tmp.isRendering = false;
    }, 1);
  };

  this.onBeforeInput = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    var data = {};

    debug('onBeforeInput', data);
    _this2.props.onBeforeInput(e, data);
  };

  this.onBlur = function (e) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isCopying) return;
    if (isNonEditable(e)) return;

    var data = {};

    debug('onBlur', data);
    _this2.props.onBlur(e, data);
  };

  this.onChange = function (state) {
    debug('onChange', state);
    _this2.props.onChange(state);
  };

  this.onCompositionStart = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isComposing = true;
    _this2.tmp.compositions++;

    debug('onCompositionStart');
  };

  this.onCompositionEnd = function (e) {
    if (isNonEditable(e)) return;

    _this2.forces++;
    var count = _this2.tmp.compositions;

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition in still in affect.
    setTimeout(function () {
      if (_this2.tmp.compositions > count) return;
      _this2.tmp.isComposing = false;
    });

    debug('onCompositionEnd');
  };

  this.onCopy = function (e) {
    if (isNonEditable(e)) return;
    var window = (0, _getWindow2.default)(e.target);

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;

    debug('onCopy', data);
    _this2.props.onCopy(e, data);
  };

  this.onCut = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;
    var window = (0, _getWindow2.default)(e.target);

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;

    debug('onCut', data);
    _this2.props.onCut(e, data);
  };

  this.onDragEnd = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isDragging = false;
    _this2.tmp.isInternalDrag = null;

    debug('onDragEnd');
  };

  this.onDragOver = function (e) {
    if (isNonEditable(e)) return;

    var dataTransfer = e.nativeEvent.dataTransfer;

    var transfer = new _transfer2.default(dataTransfer);

    // Prevent default when nodes are dragged to allow dropping.
    if (transfer.getType() == 'node') {
      e.preventDefault();
    }

    if (_this2.tmp.isDragging) return;
    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = false;

    debug('onDragOver');
  };

  this.onDragStart = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = true;
    var dataTransfer = e.nativeEvent.dataTransfer;

    var transfer = new _transfer2.default(dataTransfer);

    // If it's a node being dragged, the data type is already set.
    if (transfer.getType() == 'node') return;

    var state = _this2.props.state;
    var fragment = state.fragment;

    var encoded = _base2.default.serializeNode(fragment);
    dataTransfer.setData(_types2.default.FRAGMENT, encoded);

    debug('onDragStart');
  };

  this.onDrop = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    e.preventDefault();

    var window = (0, _getWindow2.default)(e.target);
    var state = _this2.props.state;
    var selection = state.selection;
    var _e$nativeEvent = e.nativeEvent;
    var dataTransfer = _e$nativeEvent.dataTransfer;
    var x = _e$nativeEvent.x;
    var y = _e$nativeEvent.y;

    var transfer = new _transfer2.default(dataTransfer);
    var data = transfer.getData();

    // Resolve the point where the drop occured.
    var range = void 0;

    // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
    if (window.document.caretRangeFromPoint) {
      range = window.document.caretRangeFromPoint(x, y);
    } else {
      range = window.document.createRange();
      range.setStart(e.nativeEvent.rangeParent, e.nativeEvent.rangeOffset);
    }

    var startNode = range.startContainer;
    var startOffset = range.startOffset;
    var point = _this2.getPoint(startNode, startOffset);
    var target = _selection2.default.create({
      anchorKey: point.key,
      anchorOffset: point.offset,
      focusKey: point.key,
      focusOffset: point.offset,
      isFocused: true
    });

    // If the target is inside a void node, abort.
    if (state.document.hasVoidParent(point.key)) return;

    // Add drop-specific information to the data.
    data.target = target;
    data.effect = dataTransfer.dropEffect;

    if (data.type == 'fragment' || data.type == 'node') {
      data.isInternal = _this2.tmp.isInternalDrag;
    }

    debug('onDrop', data);
    _this2.props.onDrop(e, data);
  };

  this.onInput = function (e) {
    if (_this2.tmp.isRendering) return;
    if (_this2.tmp.isComposing) return;
    if (isNonEditable(e)) return;
    debug('onInput');

    var window = (0, _getWindow2.default)(e.target);

    // Get the selection point.
    var native = window.getSelection();
    var anchorNode = native.anchorNode;
    var anchorOffset = native.anchorOffset;
    var focusOffset = native.focusOffset;

    var point = _this2.getPoint(anchorNode, anchorOffset);
    var key = point.key;
    var index = point.index;
    var start = point.start;
    var end = point.end;

    // Get the range in question.

    var _props2 = _this2.props;
    var state = _props2.state;
    var editor = _props2.editor;
    var document = state.document;
    var selection = state.selection;

    var schema = editor.getSchema();
    var decorators = document.getDescendantDecorators(key, schema);
    var node = document.getDescendant(key);
    var ranges = node.getRanges(decorators);
    var range = ranges.get(index);

    // Get the text information.
    var isLast = index == ranges.size - 1;
    var text = range.text;
    var marks = range.marks;
    var textContent = anchorNode.textContent;

    var lastChar = textContent.charAt(textContent.length - 1);

    // If we're dealing with the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLast && lastChar == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var after = selection.collapseToEnd().moveForward(delta);

    // Create an updated state with the text replaced.
    var next = state.transform().moveTo({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end
    }).delete().insertText(textContent, marks).moveTo(after).apply();

    // Change the current state.
    _this2.onChange(next);
  };

  this.onKeyDown = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    var key = (0, _keycode2.default)(e.which);
    var data = {};

    // When composing, these characters commit the composition but also move the
    // selection before we're able to handle it, so prevent their default,
    // selection-moving behavior.
    if (_this2.tmp.isComposing && (key == 'left' || key == 'right' || key == 'up' || key == 'down')) {
      e.preventDefault();
      return;
    }

    // Add helpful properties for handling hotkeys to the data object.
    data.code = e.which;
    data.key = key;
    data.isAlt = e.altKey;
    data.isCmd = _environment.IS_MAC ? e.metaKey && !e.altKey : false;
    data.isCtrl = e.ctrlKey && !e.altKey;
    data.isLine = _environment.IS_MAC ? e.metaKey : false;
    data.isMeta = e.metaKey;
    data.isMod = _environment.IS_MAC ? e.metaKey && !e.altKey : e.ctrlKey && !e.altKey;
    data.isModAlt = _environment.IS_MAC ? e.metaKey && e.altKey : e.ctrlKey && e.altKey;
    data.isShift = e.shiftKey;
    data.isWord = _environment.IS_MAC ? e.altKey : e.ctrlKey;

    // These key commands have native behavior in contenteditable elements which
    // will cause our state to be out of sync, so prevent them.
    if (key == 'enter' || key == 'backspace' || key == 'delete' || key == 'b' && data.isMod || key == 'i' && data.isMod || key == 'y' && data.isMod || key == 'z' && data.isMod) {
      e.preventDefault();
    }

    debug('onKeyDown', data);
    _this2.props.onKeyDown(e, data);
  };

  this.onPaste = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    e.preventDefault();
    var transfer = new _transfer2.default(e.clipboardData);
    var data = transfer.getData();

    debug('onPaste', data);
    _this2.props.onPaste(e, data);
  };

  this.onSelect = function (e) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isRendering) return;
    if (_this2.tmp.isCopying) return;
    if (_this2.tmp.isComposing) return;
    if (isNonEditable(e)) return;

    var window = (0, _getWindow2.default)(e.target);
    var state = _this2.props.state;
    var document = state.document;
    var selection = state.selection;

    var native = window.getSelection();
    var data = {};

    // If there are no ranges, the editor was blurred natively.
    if (!native.rangeCount) {
      data.selection = selection.merge({ isFocused: false });
      data.isNative = true;
    }

    // Otherwise, determine the Slate selection from the native one.
    else {
        var anchorNode = native.anchorNode;
        var anchorOffset = native.anchorOffset;
        var focusNode = native.focusNode;
        var focusOffset = native.focusOffset;

        var anchor = _this2.getPoint(anchorNode, anchorOffset);
        var focus = _this2.getPoint(focusNode, focusOffset);

        // There are valid situations where a select event will fire when we're
        // already at that position (for example when entering a character), since
        // our `insertText` transform already updates the selection. In those
        // cases we can safely ignore the event.
        if (anchor.key == selection.anchorKey && anchor.offset == selection.anchorOffset && focus.key == selection.focusKey && focus.offset == selection.focusOffset && selection.isFocused) {
          return;
        }

        var properties = {
          anchorKey: anchor.key,
          anchorOffset: anchor.offset,
          focusKey: focus.key,
          focusOffset: focus.offset,
          isFocused: true,
          isBackward: null
        };

        data.selection = selection.merge(properties).normalize(document);
      }

    debug('onSelect', { data: data, selection: data.selection.toJS() });
    _this2.props.onSelect(e, data);
  };

  this.render = function () {
    debug('render');

    var _props3 = _this2.props;
    var className = _props3.className;
    var readOnly = _props3.readOnly;
    var state = _props3.state;
    var document = state.document;

    var children = document.nodes.map(function (node) {
      return _this2.renderNode(node);
    }).toArray();

    var style = _extends({
      // Prevent the default outline styles.
      outline: 'none',
      // Preserve adjacent whitespace and new lines.
      whiteSpace: 'pre-wrap',
      // Allow words to break if they are too long.
      wordWrap: 'break-word'
    }, readOnly ? {} : { WebkitUserModify: 'read-write-plaintext-only' }, _this2.props.style);

    // COMPAT: In Firefox, spellchecking can remove entire wrapping elements
    // including inline ones like `<a>`, which is jarring for the user but also
    // causes the DOM to get into an irreconilable state.
    var spellCheck = _environment.IS_FIREFOX ? false : _this2.props.spellCheck;

    return _react2.default.createElement(
      'div',
      {
        key: _this2.forces,
        contentEditable: !readOnly,
        suppressContentEditableWarning: true,
        className: className,
        onBeforeInput: _this2.onBeforeInput,
        onBlur: _this2.onBlur,
        onCompositionEnd: _this2.onCompositionEnd,
        onCompositionStart: _this2.onCompositionStart,
        onCopy: _this2.onCopy,
        onCut: _this2.onCut,
        onDragEnd: _this2.onDragEnd,
        onDragOver: _this2.onDragOver,
        onDragStart: _this2.onDragStart,
        onDrop: _this2.onDrop,
        onInput: _this2.onInput,
        onKeyDown: _this2.onKeyDown,
        onKeyUp: noop,
        onPaste: _this2.onPaste,
        onSelect: _this2.onSelect,
        spellCheck: spellCheck,
        style: style
      },
      children
    );
  };

  this.renderNode = function (node) {
    var _props4 = _this2.props;
    var editor = _props4.editor;
    var schema = _props4.schema;
    var state = _props4.state;


    return _react2.default.createElement(_node2.default, {
      key: node.key,
      node: node,
      parent: state.document,
      schema: schema,
      state: state,
      editor: editor
    });
  };
};

function isNonEditable(event) {
  var target = event.target;
  var currentTarget = event.currentTarget;

  var nonEditable = target.closest('[contenteditable="false"]');
  var isContained = currentTarget.contains(nonEditable);
  return isContained;
}

/**
 * Export.
 */

exports.default = Content;