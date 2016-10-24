'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Start-and-end convenience methods to auto-generate.
 */

var START_END_METHODS = ['collapseTo%'];

/**
 * Start-end-and-edge convenience methods to auto-generate.
 */

var EDGE_METHODS = ['has%AtStartOf', 'has%AtEndOf', 'has%Between', 'has%In'];

/**
 * Default properties.
 */

var DEFAULTS = {
  anchorKey: null,
  anchorOffset: 0,
  focusKey: null,
  focusOffset: 0,
  isBackward: null,
  isFocused: false
};

/**
 * Selection.
 */

var Selection = function (_ref) {
  _inherits(Selection, _ref);

  function Selection() {
    _classCallCheck(this, Selection);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Selection).apply(this, arguments));
  }

  _createClass(Selection, [{
    key: 'hasAnchorAtStartOf',


    /**
     * Check whether anchor point of the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

    value: function hasAnchorAtStartOf(node) {
      if (this.anchorOffset != 0) return false;
      var first = node.kind == 'text' ? node : node.getTexts().first();
      return this.anchorKey == first.key;
    }

    /**
     * Check whether anchor point of the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorAtEndOf',
    value: function hasAnchorAtEndOf(node) {
      var last = node.kind == 'text' ? node : node.getTexts().last();
      return this.anchorKey == last.key && this.anchorOffset == last.length;
    }

    /**
     * Check whether the anchor edge of a selection is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorBetween',
    value: function hasAnchorBetween(node, start, end) {
      return this.anchorOffset <= end && start <= this.anchorOffset && this.hasAnchorIn(node);
    }

    /**
     * Check whether the anchor edge of a selection is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorIn',
    value: function hasAnchorIn(node) {
      var _this2 = this;

      var nodes = node.kind == 'text' ? [node] : node.getTexts();
      return nodes.some(function (n) {
        return n.key == _this2.anchorKey;
      });
    }

    /**
     * Check whether focus point of the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtEndOf',
    value: function hasFocusAtEndOf(node) {
      var last = node.kind == 'text' ? node : node.getTexts().last();
      return this.focusKey == last.key && this.focusOffset == last.length;
    }

    /**
     * Check whether focus point of the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtStartOf',
    value: function hasFocusAtStartOf(node) {
      if (this.focusOffset != 0) return false;
      var first = node.kind == 'text' ? node : node.getTexts().first();
      return this.focusKey == first.key;
    }

    /**
     * Check whether the focus edge of a selection is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusBetween',
    value: function hasFocusBetween(node, start, end) {
      return start <= this.focusOffset && this.focusOffset <= end && this.hasFocusIn(node);
    }

    /**
     * Check whether the focus edge of a selection is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusIn',
    value: function hasFocusIn(node) {
      var _this3 = this;

      var nodes = node.kind == 'text' ? [node] : node.getTexts();
      return nodes.some(function (n) {
        return n.key == _this3.focusKey;
      });
    }

    /**
     * Check whether the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean} isAtStart
     */

  }, {
    key: 'isAtStartOf',
    value: function isAtStartOf(node) {
      var isExpanded = this.isExpanded;
      var startKey = this.startKey;
      var startOffset = this.startOffset;

      if (isExpanded) return false;
      if (startOffset != 0) return false;
      var first = node.kind == 'text' ? node : node.getTexts().first();
      return startKey == first.key;
    }

    /**
     * Check whether the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean} isAtEnd
     */

  }, {
    key: 'isAtEndOf',
    value: function isAtEndOf(node) {
      var endKey = this.endKey;
      var endOffset = this.endOffset;
      var isExpanded = this.isExpanded;

      if (isExpanded) return false;
      var last = node.kind == 'text' ? node : node.getTexts().last();
      return endKey == last.key && endOffset == last.length;
    }

    /**
     * Normalize the selection, relative to a `node`, ensuring that the anchor
     * and focus nodes of the selection always refer to leaf text nodes.
     *
     * @param {Node} node
     * @return {Selection} selection
     */

  }, {
    key: 'normalize',
    value: function normalize(node) {
      var selection = this;
      var isCollapsed = selection.isCollapsed;
      var anchorKey = selection.anchorKey;
      var anchorOffset = selection.anchorOffset;
      var focusKey = selection.focusKey;
      var focusOffset = selection.focusOffset;
      var isBackward = selection.isBackward;

      // If the selection isn't formed yet or is malformed, set it to the
      // beginning of the node.

      if (anchorKey == null || focusKey == null || !node.hasDescendant(anchorKey) || !node.hasDescendant(focusKey)) {
        var first = node.getTexts().first();
        return selection.merge({
          anchorKey: first.key,
          anchorOffset: 0,
          focusKey: first.key,
          focusOffset: 0,
          isBackward: false
        });
      }

      // Get the anchor and focus nodes.
      var anchorNode = node.getDescendant(anchorKey);
      var focusNode = node.getDescendant(focusKey);

      // If the anchor node isn't a text node, match it to one.
      if (anchorNode.kind != 'text') {
        var anchorText = anchorNode.getTextAtOffset(anchorOffset);
        var offset = anchorNode.getOffset(anchorText);
        anchorOffset = anchorOffset - offset;
        anchorNode = anchorText;
      }

      // If the focus node isn't a text node, match it to one.
      if (focusNode.kind != 'text') {
        var focusText = focusNode.getTextAtOffset(focusOffset);
        var _offset = focusNode.getOffset(focusText);
        focusOffset = focusOffset - _offset;
        focusNode = focusText;
      }

      // If `isBackward` is not set, derive it.
      if (isBackward == null) {
        var texts = node.getTexts();
        var anchorIndex = texts.indexOf(anchorNode);
        var focusIndex = texts.indexOf(focusNode);
        isBackward = anchorIndex == focusIndex ? anchorOffset > focusOffset : anchorIndex > focusIndex;
      }

      // Merge in any updated properties.
      return selection.merge({
        anchorKey: anchorNode.key,
        anchorOffset: anchorOffset,
        focusKey: focusNode.key,
        focusOffset: focusOffset,
        isBackward: isBackward
      });
    }

    /**
     * Focus the selection.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'focus',
    value: function focus() {
      return this.merge({
        isFocused: true
      });
    }

    /**
     * Blur the selection.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'blur',
    value: function blur() {
      return this.merge({
        isFocused: false
      });
    }

    /**
     * Move the focus point to the anchor point.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'collapseToAnchor',
    value: function collapseToAnchor() {
      return this.merge({
        focusKey: this.anchorKey,
        focusOffset: this.anchorOffset,
        isBackward: false
      });
    }

    /**
     * Move the anchor point to the focus point.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'collapseToFocus',
    value: function collapseToFocus() {
      return this.merge({
        anchorKey: this.focusKey,
        anchorOffset: this.focusOffset,
        isBackward: false
      });
    }

    /**
     * Move to the start of a `node`.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'collapseToStartOf',
    value: function collapseToStartOf(node) {
      return this.merge({
        anchorKey: node.key,
        anchorOffset: 0,
        focusKey: node.key,
        focusOffset: 0,
        isBackward: false
      });
    }

    /**
     * Move to the end of a `node`.
     *
     * @return {Selection} selection
     */

  }, {
    key: 'collapseToEndOf',
    value: function collapseToEndOf(node) {
      return this.merge({
        anchorKey: node.key,
        anchorOffset: node.length,
        focusKey: node.key,
        focusOffset: node.length,
        isBackward: false
      });
    }

    /**
     * Move to the entire range of `start` and `end` nodes.
     *
     * @param {Node} start
     * @param {Node} end (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'moveToRangeOf',
    value: function moveToRangeOf(start) {
      var end = arguments.length <= 1 || arguments[1] === undefined ? start : arguments[1];

      return this.merge({
        anchorKey: start.key,
        anchorOffset: 0,
        focusKey: end.key,
        focusOffset: end.length,
        isBackward: start == end ? false : null
      });
    }

    /**
     * Move the selection forward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'moveForward',
    value: function moveForward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      return this.merge({
        anchorOffset: this.anchorOffset + n,
        focusOffset: this.focusOffset + n
      });
    }

    /**
     * Move the selection backward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'moveBackward',
    value: function moveBackward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      return this.merge({
        anchorOffset: this.anchorOffset - n,
        focusOffset: this.focusOffset - n
      });
    }

    /**
     * Move the selection to `anchor` and `focus` offsets.
     *
     * @param {Number} anchor
     * @param {Number} focus (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'moveToOffsets',
    value: function moveToOffsets(anchor) {
      var focus = arguments.length <= 1 || arguments[1] === undefined ? anchor : arguments[1];

      return this.merge({
        anchorOffset: anchor,
        focusOffset: focus,
        isBackward: null
      });
    }

    /**
     * Extend the focus point forward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'extendForward',
    value: function extendForward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      return this.merge({
        focusOffset: this.focusOffset + n,
        isBackward: null
      });
    }

    /**
     * Extend the focus point backward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection} selection
     */

  }, {
    key: 'extendBackward',
    value: function extendBackward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      return this.merge({
        focusOffset: this.focusOffset - n,
        isBackward: null
      });
    }

    /**
     * Extend the focus point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Selection} selection
     */

  }, {
    key: 'extendToStartOf',
    value: function extendToStartOf(node) {
      return this.merge({
        focusKey: node.key,
        focusOffset: 0,
        isBackward: null
      });
    }

    /**
     * Extend the focus point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Selection} selection
     */

  }, {
    key: 'extendToEndOf',
    value: function extendToEndOf(node) {
      return this.merge({
        focusKey: node.key,
        focusOffset: node.length,
        isBackward: null
      });
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'selection';
    }

    /**
     * Get whether the selection is blurred.
     *
     * @return {Boolean} isBlurred
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return !this.isFocused;
    }

    /**
     * Get whether the selection is collapsed.
     *
     * @return {Boolean} isCollapsed
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.anchorKey == this.focusKey && this.anchorOffset == this.focusOffset;
    }

    /**
     * Get whether the selection is expanded.
     *
     * @return {Boolean} isExpanded
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return !this.isCollapsed;
    }

    /**
     * Get whether the selection is forward.
     *
     * @return {Boolean} isForward
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.isBackward == null ? null : !this.isBackward;
    }

    /**
     * Get the start key.
     *
     * @return {String} startKey
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.isBackward ? this.focusKey : this.anchorKey;
    }
  }, {
    key: 'startOffset',
    get: function get() {
      return this.isBackward ? this.focusOffset : this.anchorOffset;
    }
  }, {
    key: 'endKey',
    get: function get() {
      return this.isBackward ? this.anchorKey : this.focusKey;
    }
  }, {
    key: 'endOffset',
    get: function get() {
      return this.isBackward ? this.anchorOffset : this.focusOffset;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Selection` with `properties`.
     *
     * @param {Object} properties
     * @return {Selection} selection
     */

    value: function create() {
      var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (properties instanceof Selection) return properties;
      return new Selection(properties);
    }
  }]);

  return Selection;
}(new _immutable.Record(DEFAULTS));

/**
 * Add start, end and edge convenience methods.
 */

START_END_METHODS.concat(EDGE_METHODS).forEach(function (pattern) {
  var _pattern$split = pattern.split('%');

  var _pattern$split2 = _slicedToArray(_pattern$split, 2);

  var p = _pattern$split2[0];
  var s = _pattern$split2[1];

  var anchor = p + 'Anchor' + s;
  var edge = p + 'Edge' + s;
  var end = p + 'End' + s;
  var focus = p + 'Focus' + s;
  var start = p + 'Start' + s;

  Selection.prototype[start] = function () {
    return this.isBackward ? this[focus].apply(this, arguments) : this[anchor].apply(this, arguments);
  };

  Selection.prototype[end] = function () {
    return this.isBackward ? this[anchor].apply(this, arguments) : this[focus].apply(this, arguments);
  };

  if (!(0, _includes2.default)(EDGE_METHODS, pattern)) return;

  Selection.prototype[edge] = function () {
    return this[anchor].apply(this, arguments) || this[focus].apply(this, arguments);
  };
});

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Selection.prototype, ['hasAnchorAtStartOf', 'hasAnchorAtEndOf', 'hasAnchorBetween', 'hasAnchorIn', 'hasFocusAtEndOf', 'hasFocusAtStartOf', 'hasFocusBetween', 'hasFocusIn', 'isAtStartOf', 'isAtEndOf']);

/**
 * Export.
 */

exports.default = Selection;