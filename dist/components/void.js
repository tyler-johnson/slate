'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _environment = require('../utils/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Void.
 *
 * @type {Component}
 */

var Void = function (_React$Component) {
  _inherits(Void, _React$Component);

  function Void() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Void);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Void)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = function (props, state) {
      return props.node != _this.props.node || props.state.isFocused && props.state.selection.hasEdgeIn(props.node);
    }, _this.onClick = function (e) {
      e.preventDefault();
      var _this$props = _this.props;
      var state = _this$props.state;
      var node = _this$props.node;
      var editor = _this$props.editor;

      var next = state.transform().moveToRangeOf(node).focus().apply();

      editor.onChange(next);
    }, _this.render = function () {
      var _this$props2 = _this.props;
      var children = _this$props2.children;
      var node = _this$props2.node;
      var className = _this$props2.className;
      var style = _this$props2.style;

      var Tag = node.kind == 'block' ? 'div' : 'span';

      // Make the outer wrapper relative, so the spacer can overlay it.
      var styles = _extends({}, style, {
        position: 'relative'
      });

      return _react2.default.createElement(
        Tag,
        {
          contentEditable: false,
          'data-void': 'true',
          onClick: _this.onClick
        },
        _react2.default.createElement(
          Tag,
          {
            contentEditable: true,
            suppressContentEditableWarning: true,
            className: className,
            style: styles
          },
          _this.renderSpacer(),
          _react2.default.createElement(
            Tag,
            { contentEditable: false },
            children
          )
        )
      );
    }, _this.renderSpacer = function () {
      // COMPAT: In Firefox, if the <span> is positioned absolutely, it won't
      // receive the cursor properly when navigating via arrow keys.
      var style = _environment.IS_FIREFOX ? {
        pointerEvents: 'none',
        width: '0px',
        height: '0px',
        lineHeight: '0px',
        visibility: 'hidden'
      } : {
        position: 'absolute',
        top: '0px',
        left: '-9999px',
        textIndent: '-9999px'
      };

      return _react2.default.createElement(
        'span',
        { style: style },
        _this.renderLeaf()
      );
    }, _this.renderLeaf = function () {
      var _this$props3 = _this.props;
      var node = _this$props3.node;
      var state = _this$props3.state;

      var child = node.getTexts().first();
      var ranges = child.getRanges();
      var text = '';
      var marks = _mark2.default.createSet();
      var index = 0;
      var offsetKey = _offsetKey2.default.stringify({
        key: child.key,
        index: index
      });

      return _react2.default.createElement(_leaf2.default, {
        renderMark: _this.renderLeafMark,
        key: offsetKey,
        state: state,
        node: child,
        ranges: ranges,
        index: index,
        text: text,
        marks: marks
      });
    }, _this.renderLeafMark = function (mark) {
      return {};
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
   */

  /**
   * Default properties.
   */

  /**
   * Should the component update?
   *
   * @param {Object} props
   * @param {Object} state
   * @return {Boolean}
   */

  /**
   * When one of the wrapper elements it clicked, select the void node.
   *
   * @param {Event} e
   */

  /**
   * Render.
   *
   * @return {Element}
   */

  /**
   * Render a fake spacer leaf, which will catch the cursor when it the void
   * node is navigated to with the arrow keys. Having this spacer there means
   * the browser continues to manage the selection natively, so it keeps track
   * of the right offset when moving across the block.
   *
   * @return {Element}
   */

  /**
   * Render a fake leaf.
   *
   * @return {Element}
   */

  /**
   * Render a fake leaf mark.
   *
   * @return {Object}
   */

  return Void;
}(_react2.default.Component);

/**
 * Export.
 */

Void.propTypes = {
  children: _react2.default.PropTypes.any.isRequired,
  className: _react2.default.PropTypes.string,
  editor: _react2.default.PropTypes.object.isRequired,
  node: _react2.default.PropTypes.object.isRequired,
  state: _react2.default.PropTypes.object.isRequired,
  style: _react2.default.PropTypes.object
};
Void.defaultProps = {
  style: {}
};
exports.default = Void;