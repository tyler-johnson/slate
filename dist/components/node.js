'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _types = require('../utils/types');

var _types2 = _interopRequireDefault(_types);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Node.
 *
 * @type {Component}
 */

var Node = function (_React$Component) {
  _inherits(Node, _React$Component);

  function Node() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Node);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Node)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = function (props) {
      return props.node != _this.props.node || props.state.isFocused && props.state.selection.hasEdgeIn(props.node);
    }, _this.onDragStart = function (e) {
      var node = _this.props.node;

      var encoded = _base2.default.serializeNode(node);
      var data = e.nativeEvent.dataTransfer;
      data.setData(_types2.default.NODE, encoded);
    }, _this.render = function () {
      var node = _this.props.node;

      return node.kind == 'text' ? _this.renderText() : _this.renderElement();
    }, _this.renderNode = function (child) {
      var _this$props = _this.props;
      var editor = _this$props.editor;
      var renderDecorations = _this$props.renderDecorations;
      var renderMark = _this$props.renderMark;
      var renderNode = _this$props.renderNode;
      var state = _this$props.state;

      return _react2.default.createElement(Node, {
        key: child.key,
        node: child,
        state: state,
        editor: editor,
        renderDecorations: renderDecorations,
        renderMark: renderMark,
        renderNode: renderNode
      });
    }, _this.renderElement = function () {
      var _this$props2 = _this.props;
      var editor = _this$props2.editor;
      var node = _this$props2.node;
      var renderNode = _this$props2.renderNode;
      var state = _this$props2.state;

      var Component = renderNode(node);
      var children = node.nodes.map(function (child) {
        return _this.renderNode(child);
      }).toArray();

      // Attributes that the developer has to mix into the element in their custom
      // renderer component.
      var attributes = {
        'data-key': node.key,
        'onDragStart': _this.onDragStart
      };

      return _react2.default.createElement(
        Component,
        {
          attributes: attributes,
          key: node.key,
          editor: editor,
          node: node,
          state: state
        },
        children
      );
    }, _this.renderText = function () {
      var _this$props3 = _this.props;
      var node = _this$props3.node;
      var editor = _this$props3.editor;
      var renderDecorations = _this$props3.renderDecorations;
      var renderMark = _this$props3.renderMark;
      var state = _this$props3.state;

      return _react2.default.createElement(_text2.default, {
        key: node.key,
        editor: editor,
        node: node,
        renderDecorations: renderDecorations,
        renderMark: renderMark,
        state: state
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * On drag start, add a serialized representation of the node to the data.
   *
   * @param {Event} e
   */

  /**
   * Render.
   *
   * @return {Element} element
   */

  /**
   * Render a `child` node.
   *
   * @param {Node} child
   * @return {Element} element
   */

  /**
   * Render an element `node`.
   *
   * @return {Element} element
   */

  /**
   * Render a text node.
   *
   * @return {Element} element
   */

  return Node;
}(_react2.default.Component);

/**
 * Export.
 */

Node.propTypes = {
  editor: _react2.default.PropTypes.object.isRequired,
  node: _react2.default.PropTypes.object.isRequired,
  renderDecorations: _react2.default.PropTypes.func.isRequired,
  renderMark: _react2.default.PropTypes.func.isRequired,
  renderNode: _react2.default.PropTypes.func.isRequired,
  state: _react2.default.PropTypes.object.isRequired
};
Node.defaultProps = {
  style: {}
};
exports.default = Node;