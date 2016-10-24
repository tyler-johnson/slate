'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _types = require('../utils/types');

var _types2 = _interopRequireDefault(_types);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _environment = require('../utils/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Content).call(this, props));

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
   * @param {Object} state]
   */

  /**
   * When finished rendering, move the `isRendering` flag on next tick.
   *
   * @param {Object} props
   * @param {Object} state]
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
      var offsetKey = _offsetKey2.default.findKey(element, offset);
      var ranges = this.getRanges(offsetKey.key);
      var point = _offsetKey2.default.findPoint(offsetKey, ranges);
      return point;
    }

    /**
     * Get the ranges for a text node by `key`.
     *
     * @param {String} key
     * @return {List}
     */

  }, {
    key: 'getRanges',
    value: function getRanges(key) {
      var _props = this.props;
      var state = _props.state;
      var renderDecorations = _props.renderDecorations;

      var node = state.document.getDescendant(key);
      var block = state.document.getClosestBlock(node);
      var ranges = node.getDecoratedRanges(block, renderDecorations);
      return ranges;
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
  renderDecorations: _react2.default.PropTypes.func.isRequired,
  renderMark: _react2.default.PropTypes.func.isRequired,
  renderNode: _react2.default.PropTypes.func.isRequired,
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
    return props.className != _this2.props.className || props.readOnly != _this2.props.readOnly || props.spellCheck != _this2.props.spellCheck || props.style != _this2.props.style || props.state.isNative !== true;
  };

  this.componentWillUpdate = function (props, state) {
    _this2.tmp.isRendering = true;
  };

  this.componentDidUpdate = function (props, state) {
    setTimeout(function () {
      _this2.tmp.isRendering = false;
    });
  };

  this.onBeforeInput = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    var data = {};
    _this2.props.onBeforeInput(e, data);
  };

  this.onBlur = function (e) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isCopying) return;
    if (isNonEditable(e)) return;

    var data = {};
    _this2.props.onBlur(e, data);
  };

  this.onChange = function (state) {
    _this2.props.onChange(state);
  };

  this.onCompositionStart = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isComposing = true;
    _this2.tmp.compositions++;
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
  };

  this.onCopy = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;
    _this2.props.onCopy(e, data);
  };

  this.onCut = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;
    _this2.props.onCut(e, data);
  };

  this.onDragEnd = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isDragging = false;
    _this2.tmp.isInternalDrag = null;
  };

  this.onDragOver = function (e) {
    if (isNonEditable(e)) return;

    var data = e.nativeEvent.dataTransfer;
    // COMPAT: In Firefox, `types` is array-like. (2016/06/21)
    var types = Array.from(data.types);

    // Prevent default when nodes are dragged to allow dropping.
    if ((0, _includes2.default)(types, _types2.default.NODE)) {
      e.preventDefault();
    }

    if (_this2.tmp.isDragging) return;
    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = false;
  };

  this.onDragStart = function (e) {
    if (isNonEditable(e)) return;

    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = true;
    var data = e.nativeEvent.dataTransfer;
    // COMPAT: In Firefox, `types` is array-like. (2016/06/21)
    var types = Array.from(data.types);

    // If it's a node being dragged, the data type is already set.
    if ((0, _includes2.default)(types, _types2.default.NODE)) return;

    var state = _this2.props.state;
    var fragment = state.fragment;

    var encoded = _base2.default.serializeNode(fragment);
    data.setData(_types2.default.FRAGMENT, encoded);
  };

  this.onDrop = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    e.preventDefault();

    var _props2 = _this2.props;
    var state = _props2.state;
    var renderDecorations = _props2.renderDecorations;
    var selection = state.selection;
    var _e$nativeEvent = e.nativeEvent;
    var dataTransfer = _e$nativeEvent.dataTransfer;
    var x = _e$nativeEvent.x;
    var y = _e$nativeEvent.y;

    var data = {};

    // COMPAT: In Firefox, `types` is array-like. (2016/06/21)
    var types = Array.from(dataTransfer.types);

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

    // Handle Slate fragments.
    if ((0, _includes2.default)(types, _types2.default.FRAGMENT)) {
      var encoded = dataTransfer.getData(_types2.default.FRAGMENT);
      var fragment = _base2.default.deserializeNode(encoded);
      data.type = 'fragment';
      data.fragment = fragment;
      data.isInternal = _this2.tmp.isInternalDrag;
    }

    // Handle Slate nodes.
    else if ((0, _includes2.default)(types, _types2.default.NODE)) {
        var _encoded = dataTransfer.getData(_types2.default.NODE);
        var node = _base2.default.deserializeNode(_encoded);
        data.type = 'node';
        data.node = node;
        data.isInternal = _this2.tmp.isInternalDrag;
      }

      // Handle files.
      else if (dataTransfer.files.length) {
          data.type = 'files';
          data.files = dataTransfer.files;
        }

        // Handle HTML.
        else if ((0, _includes2.default)(types, _types2.default.HTML)) {
            data.type = 'html';
            data.text = dataTransfer.getData(_types2.default.TEXT);
            data.html = dataTransfer.getData(_types2.default.HTML);
          }

          // Handle plain text.
          else {
              data.type = 'text';
              data.text = dataTransfer.getData(_types2.default.TEXT);
            }

    data.target = target;
    data.effect = dataTransfer.dropEffect;
    _this2.props.onDrop(e, data);
  };

  this.onInput = function (e) {
    if (isNonEditable(e)) return;

    var _props3 = _this2.props;
    var state = _props3.state;
    var renderDecorations = _props3.renderDecorations;
    var _state = state;
    var selection = _state.selection;

    var native = window.getSelection();
    var anchorNode = native.anchorNode;
    var anchorOffset = native.anchorOffset;
    var focusOffset = native.focusOffset;

    var point = _this2.getPoint(anchorNode, anchorOffset);
    var key = point.key;
    var index = point.index;
    var start = point.start;
    var end = point.end;

    var ranges = _this2.getRanges(key);
    var range = ranges.get(index);
    var text = range.text;
    var marks = range.marks;
    var textContent = anchorNode.textContent;

    // COMPAT: If the DOM text ends in a new line, we will have added one to
    // account for browsers collapsing a single one, so remove it.

    if (textContent.charAt(textContent.length - 1) == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var after = selection.collapseToEnd().moveForward(delta);

    // Create an updated state with the text replaced.
    state = state.transform().moveTo({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end
    }).delete().insertText(textContent, marks).moveTo(after).apply();

    // Change the current state.
    _this2.onChange(state);
  };

  this.onKeyDown = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    var key = (0, _keycode2.default)(e.which);
    var data = {};

    // Add helpful properties for handling hotkeys to the data object.
    data.code = e.which;
    data.key = key;
    data.isAlt = e.altKey;
    data.isCmd = _environment.IS_MAC ? e.metaKey && !e.altKey : false;
    data.isCtrl = e.ctrlKey && !e.altKey;
    data.isLine = _environment.IS_MAC ? e.metaKey : false;
    data.isMeta = e.metaKey;
    data.isMod = _environment.IS_MAC ? e.metaKey && !e.altKey : e.ctrlKey && !e.altKey;
    data.isShift = e.shiftKey;
    data.isWord = _environment.IS_MAC ? e.altKey : e.ctrlKey;

    // When composing, these characters commit the composition but also move the
    // selection before we're able to handle it, so prevent their default,
    // selection-moving behavior.
    if (_this2.tmp.isComposing && (key == 'left' || key == 'right' || key == 'up' || key == 'down')) {
      e.preventDefault();
      return;
    }

    // These key commands have native behavior in contenteditable elements which
    // will cause our state to be out of sync, so prevent them.
    if (key == 'enter' || key == 'backspace' || key == 'delete' || key == 'b' && data.isMod || key == 'i' && data.isMod || key == 'y' && data.isMod || key == 'z' && data.isMod) {
      e.preventDefault();
    }

    _this2.props.onKeyDown(e, data);
  };

  this.onPaste = function (e) {
    if (_this2.props.readOnly) return;
    if (isNonEditable(e)) return;

    e.preventDefault();

    var clipboardData = e.clipboardData;

    var data = {};

    // COMPAT: In Firefox, `types` is array-like. (2016/06/21)
    var types = Array.from(clipboardData.types);

    // Handle files.
    if (clipboardData.files.length) {
      data.type = 'files';
      data.files = clipboardData.files;
    }

    // Treat it as rich text if there is HTML content.
    else if ((0, _includes2.default)(types, _types2.default.HTML)) {
        data.type = 'html';
        data.text = clipboardData.getData(_types2.default.TEXT);
        data.html = clipboardData.getData(_types2.default.HTML);
      }

      // Treat everything else as plain text.
      else {
          data.type = 'text';
          data.text = clipboardData.getData(_types2.default.TEXT);
        }

    // If html, and the html includes a `data-fragment` attribute, it's actually
    // a raw-serialized JSON fragment from a previous cut/copy, so deserialize
    // it and update the data.
    if (data.type == 'html' && ~data.html.indexOf('<span data-fragment="')) {
      var regexp = /data-fragment="([^\s]+)"/;
      var matches = regexp.exec(data.html);

      var _matches = _slicedToArray(matches, 2);

      var full = _matches[0];
      var encoded = _matches[1];

      data.type = 'fragment';
      data.fragment = _base2.default.deserializeNode(encoded);
    }

    _this2.props.onPaste(e, data);
  };

  this.onSelect = function (e) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isRendering) return;
    if (_this2.tmp.isCopying) return;
    if (_this2.tmp.isComposing) return;
    if (isNonEditable(e)) return;

    var _props4 = _this2.props;
    var state = _props4.state;
    var renderDecorations = _props4.renderDecorations;
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
        if (anchor.key == selection.anchorKey && anchor.offset == selection.anchorOffset && focus.key == selection.focusKey && focus.offset == selection.focusOffset) {
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

    _this2.props.onSelect(e, data);
  };

  this.render = function () {
    var _props5 = _this2.props;
    var className = _props5.className;
    var readOnly = _props5.readOnly;
    var state = _props5.state;
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
        key: 'slate-content-' + _this2.forces,
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
    var _props6 = _this2.props;
    var editor = _props6.editor;
    var renderDecorations = _props6.renderDecorations;
    var renderMark = _props6.renderMark;
    var renderNode = _props6.renderNode;
    var state = _props6.state;

    return _react2.default.createElement(_node2.default, {
      key: node.key,
      node: node,
      state: state,
      editor: editor,
      renderDecorations: renderDecorations,
      renderMark: renderMark,
      renderNode: renderNode
    });
  };
};

function isNonEditable(event) {
  var target = event.target;
  var currentTarget = event.currentTarget;

  var nonEditable = target.closest('[contenteditable="false"]:not([data-void="true"])');
  var isContained = currentTarget.contains(nonEditable);
  return isContained;
}

/**
 * Export.
 */

exports.default = Content;