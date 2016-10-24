'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Leaf.
 */

var Leaf = function (_React$Component) {
  _inherits(Leaf, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  function Leaf(props) {
    _classCallCheck(this, Leaf);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Leaf).call(this, props));

    _this.tmp = {};
    _this.tmp.renders = 0;
    return _this;
  }

  /**
   * Should component update?
   *
   * @param {Object} props
   * @return {Boolean} shouldUpdate
   */

  /**
   * Properties.
   */

  _createClass(Leaf, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(props) {
      var index = props.index;
      var node = props.node;
      var state = props.state;
      var selection = state.selection;


      if (props.index != this.props.index || props.marks != this.props.marks || props.renderMark != this.props.renderMark || props.text != this.props.text) {
        return true;
      }

      if (state.isBlurred) return false;

      var _OffsetKey$findBounds = _offsetKey2.default.findBounds(index, props.ranges);

      var start = _OffsetKey$findBounds.start;
      var end = _OffsetKey$findBounds.end;

      return selection.hasEdgeBetween(node, start, end);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateSelection();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.updateSelection();
    }
  }, {
    key: 'updateSelection',
    value: function updateSelection() {
      var _props = this.props;
      var state = _props.state;
      var ranges = _props.ranges;
      var selection = state.selection;

      // If the selection is blurred we have nothing to do.

      if (selection.isBlurred) return;

      var anchorOffset = selection.anchorOffset;
      var focusOffset = selection.focusOffset;
      var _props2 = this.props;
      var node = _props2.node;
      var index = _props2.index;

      var _OffsetKey$findBounds2 = _offsetKey2.default.findBounds(index, ranges);

      var start = _OffsetKey$findBounds2.start;
      var end = _OffsetKey$findBounds2.end;

      // If neither matches, the selection doesn't start or end here, so exit.

      var hasAnchor = selection.hasAnchorBetween(node, start, end);
      var hasFocus = selection.hasFocusBetween(node, start, end);
      if (!hasAnchor && !hasFocus) return;

      // We have a selection to render, so prepare a few things...
      var native = window.getSelection();
      var el = _reactDom2.default.findDOMNode(this).firstChild;

      // If both the start and end are here, set the selection all at once.
      if (hasAnchor && hasFocus) {
        native.removeAllRanges();
        var range = window.document.createRange();
        range.setStart(el, anchorOffset - start);
        native.addRange(range);
        native.extend(el, focusOffset - start);
        return;
      }

      // If the selection is forward, we can set things in sequence. In
      // the first leaf to render, reset the selection and set the new start. And
      // then in the second leaf to render, extend to the new end.
      if (selection.isForward) {
        if (hasAnchor) {
          native.removeAllRanges();
          var _range = window.document.createRange();
          _range.setStart(el, anchorOffset - start);
          native.addRange(_range);
        } else if (hasFocus) {
          native.extend(el, focusOffset - start);
        }
      }

      // Otherwise, if the selection is backward, we need to hack the order a bit.
      // In the first leaf to render, set a phony start anchor to store the true
      // end position. And then in the second leaf to render, set the start and
      // extend the end to the stored value.
      else {
          if (hasFocus) {
            native.removeAllRanges();
            var _range2 = window.document.createRange();
            _range2.setStart(el, focusOffset - start);
            native.addRange(_range2);
          } else if (hasAnchor) {
            var endNode = native.focusNode;
            var endOffset = native.focusOffset;
            native.removeAllRanges();
            var _range3 = window.document.createRange();
            _range3.setStart(el, anchorOffset - start);
            native.addRange(_range3);
            native.extend(endNode, endOffset);
          }
        }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props;
      var node = _props3.node;
      var index = _props3.index;

      var offsetKey = _offsetKey2.default.stringify({
        key: node.key,
        index: index
      });

      // Increment the renders key, which forces a re-render whenever this
      // component is told it should update. This is required because "native"
      // renders where we don't update the leaves cause React's internal state to
      // get out of sync, causing it to not realize the DOM needs updating.
      this.tmp.renders++;

      return _react2.default.createElement(
        'span',
        {
          key: this.tmp.renders,
          'data-offset-key': offsetKey,
          style: this.renderStyle()
        },
        this.renderText()
      );
    }
  }, {
    key: 'renderText',
    value: function renderText() {
      var _props4 = this.props;
      var text = _props4.text;
      var parent = _props4.parent;

      // If the text is empty, we need to render a <br/> to get the block to have
      // the proper height.

      if (text == '') return _react2.default.createElement('br', null);

      // COMPAT: Browsers will collapse trailing new lines, so we need to add an
      // extra trailing new lines to prevent that.
      if (text.charAt(text.length - 1) == '\n') return text + '\n';

      return text;
    }
  }, {
    key: 'renderStyle',
    value: function renderStyle() {
      var _props5 = this.props;
      var marks = _props5.marks;
      var renderMark = _props5.renderMark;

      var style = marks.reduce(function (memo, mark) {
        var styles = renderMark(mark, marks);

        for (var key in styles) {
          memo[key] = styles[key];
        }

        return memo;
      }, {});

      return style;
    }
  }]);

  return Leaf;
}(_react2.default.Component);

/**
 * Export.
 */

Leaf.propTypes = {
  index: _react2.default.PropTypes.number.isRequired,
  marks: _react2.default.PropTypes.object.isRequired,
  node: _react2.default.PropTypes.object.isRequired,
  ranges: _react2.default.PropTypes.object.isRequired,
  renderMark: _react2.default.PropTypes.func.isRequired,
  state: _react2.default.PropTypes.object.isRequired,
  text: _react2.default.PropTypes.string.isRequired
};
exports.default = Leaf;