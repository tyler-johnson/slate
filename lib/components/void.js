'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _environment = require('../constants/environment');

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
 * Void.
 *
 * @type {Component}
 */

var Void = function (_React$Component) {
  _inherits(Void, _React$Component);

  function Void() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Void);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Void.__proto__ || Object.getPrototypeOf(Void)).call.apply(_ref, [this].concat(args))), _this), _this.onClick = function (e) {
      e.preventDefault();
      var _this$props = _this.props;
      var node = _this$props.node;
      var editor = _this$props.editor;

      var next = editor.getState().transform().collapseToStartOf(node).focus().apply();

      editor.onChange(next);
    }, _this.render = function () {
      var _this$props2 = _this.props;
      var children = _this$props2.children;
      var node = _this$props2.node;

      var Tag = node.kind == 'block' ? 'div' : 'span';

      // Make the outer wrapper relative, so the spacer can overlay it.
      var style = {
        position: 'relative'
      };

      return _react2.default.createElement(
        Tag,
        { style: style, onClick: _this.onClick },
        _this.renderSpacer(),
        _react2.default.createElement(
          Tag,
          { contentEditable: false },
          children
        )
      );
    }, _this.renderSpacer = function () {
      var node = _this.props.node;

      var style = void 0;

      if (node.kind == 'block') {
        style = _environment.IS_FIREFOX ? {
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
      } else {
        style = {
          position: 'relative',
          top: '0px',
          left: '-9999px',
          textIndent: '-9999px'
        };
      }

      return _react2.default.createElement(
        'span',
        { style: style },
        _this.renderLeaf()
      );
    }, _this.renderLeaf = function () {
      var _this$props3 = _this.props;
      var node = _this$props3.node;
      var schema = _this$props3.schema;
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
        isVoid: true,
        renderMark: noop,
        key: offsetKey,
        schema: schema,
        state: state,
        node: child,
        parent: node,
        ranges: ranges,
        index: index,
        text: text,
        marks: marks
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
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

  return Void;
}(_react2.default.Component);

/**
 * Export.
 */

Void.propTypes = {
  children: _react2.default.PropTypes.any.isRequired,
  editor: _react2.default.PropTypes.object.isRequired,
  node: _react2.default.PropTypes.object.isRequired,
  parent: _react2.default.PropTypes.object.isRequired,
  schema: _react2.default.PropTypes.object.isRequired,
  state: _react2.default.PropTypes.object.isRequired
};
exports.default = Void;