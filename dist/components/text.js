'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Text.
 */

var Text = function (_React$Component) {
  _inherits(Text, _React$Component);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Text).apply(this, arguments));
  }

  _createClass(Text, [{
    key: 'shouldComponentUpdate',


    /**
     * Should the component update?
     *
     * @param {Object} props
     * @param {Object} state
     * @return {Boolean} shouldUpdate
     */

    value: function shouldComponentUpdate(props, state) {
      return props.node != this.props.node || props.state.isFocused && props.state.selection.hasEdgeIn(props.node);
    }

    /**
     * Render.
     *
     * @return {Element} element
     */

    /**
     * Properties.
     */

  }, {
    key: 'render',
    value: function render() {
      var node = this.props.node;

      return _react2.default.createElement(
        'span',
        { 'data-key': node.key },
        this.renderLeaves()
      );
    }

    /**
     * Render the leaf nodes.
     *
     * @return {Array} leaves
     */

  }, {
    key: 'renderLeaves',
    value: function renderLeaves() {
      var _this2 = this;

      var _props = this.props;
      var node = _props.node;
      var state = _props.state;
      var renderDecorations = _props.renderDecorations;

      var block = state.document.getClosestBlock(node);
      var ranges = node.getDecoratedRanges(block, renderDecorations);

      return ranges.map(function (range, i, original) {
        var previous = original.slice(0, i);
        var offset = previous.size ? previous.map(function (r) {
          return r.text;
        }).join('').length : 0;
        return _this2.renderLeaf(ranges, range, i, offset);
      });
    }

    /**
     * Render a single leaf node given a `range` and `offset`.
     *
     * @param {List} ranges
     * @param {Range} range
     * @param {Number} index
     * @param {Number} offset
     * @return {Element} leaf
     */

  }, {
    key: 'renderLeaf',
    value: function renderLeaf(ranges, range, index, offset) {
      var _props2 = this.props;
      var node = _props2.node;
      var renderMark = _props2.renderMark;
      var state = _props2.state;

      var text = range.text;
      var marks = range.marks;

      return _react2.default.createElement(_leaf2.default, {
        key: node.key + '-' + index,
        index: index,
        state: state,
        node: node,
        text: text,
        marks: marks,
        ranges: ranges,
        renderMark: renderMark
      });
    }
  }]);

  return Text;
}(_react2.default.Component);

/**
 * Export.
 */

Text.propTypes = {
  editor: _react2.default.PropTypes.object.isRequired,
  node: _react2.default.PropTypes.object.isRequired,
  renderDecorations: _react2.default.PropTypes.func.isRequired,
  renderMark: _react2.default.PropTypes.func.isRequired,
  state: _react2.default.PropTypes.object.isRequired
};
exports.default = Text;