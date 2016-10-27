'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection = require('./selection');

var _selection2 = _interopRequireDefault(_selection);

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * History.
 */

var History = new _immutable.Record({
  undos: new _immutable.Stack(),
  redos: new _immutable.Stack()
});

/**
 * Default properties.
 */

var DEFAULTS = {
  document: new _document2.default(),
  selection: new _selection2.default(),
  history: new History(),
  isNative: false
};

/**
 * State.
 */

var State = function (_ref) {
  _inherits(State, _ref);

  function State() {
    _classCallCheck(this, State);

    return _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).apply(this, arguments));
  }

  _createClass(State, [{
    key: 'normalize',


    /**
     * Normalize a state against a `schema`.
     *
     * @param {Schema} schema
     * @return {State}
     */

    value: function normalize(schema) {
      var state = this;
      var document = this.document,
          selection = this.selection;

      var transform = this.transform();
      var failure = void 0;

      document.filterDescendantsDeep(function (node) {
        if (failure = node.validate(schema)) {
          var _failure = failure,
              value = _failure.value,
              rule = _failure.rule;

          rule.normalize(transform, node, value);
        }
      });

      if (failure = document.validate(schema)) {
        var _failure2 = failure,
            value = _failure2.value,
            rule = _failure2.rule;

        rule.normalize(transform, document, value);
      }

      return transform.apply({ save: false });
    }

    /**
     * Return a new `Transform` with the current state as a starting point.
     *
     * @return {Transform} transform
     */

  }, {
    key: 'transform',
    value: function transform() {
      var state = this;
      return new _transform2.default({ state: state });
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'state';
    }

    /**
     * Are there undoable events?
     *
     * @return {Boolean} hasUndos
     */

  }, {
    key: 'hasUndos',
    get: function get() {
      return this.history.undos.size > 0;
    }

    /**
     * Are there redoable events?
     *
     * @return {Boolean} hasRedos
     */

  }, {
    key: 'hasRedos',
    get: function get() {
      return this.history.redos.size > 0;
    }

    /**
     * Is the current selection blurred?
     *
     * @return {Boolean} isBlurred
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return this.selection.isBlurred;
    }

    /**
     * Is the current selection focused?
     *
     * @return {Boolean} isFocused
     */

  }, {
    key: 'isFocused',
    get: function get() {
      return this.selection.isFocused;
    }

    /**
     * Is the current selection collapsed?
     *
     * @return {Boolean} isCollapsed
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.selection.isCollapsed;
    }

    /**
     * Is the current selection expanded?
     *
     * @return {Boolean} isExpanded
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return this.selection.isExpanded;
    }

    /**
     * Is the current selection backward?
     *
     * @return {Boolean} isBackward
     */

  }, {
    key: 'isBackward',
    get: function get() {
      return this.selection.isBackward;
    }

    /**
     * Is the current selection forward?
     *
     * @return {Boolean} isForward
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.selection.isForward;
    }

    /**
     * Get the current start key.
     *
     * @return {String} startKey
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.selection.startKey;
    }

    /**
     * Get the current end key.
     *
     * @return {String} endKey
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.selection.endKey;
    }

    /**
     * Get the current start offset.
     *
     * @return {String} startOffset
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.selection.startOffset;
    }

    /**
     * Get the current end offset.
     *
     * @return {String} endOffset
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.selection.endOffset;
    }

    /**
     * Get the current anchor key.
     *
     * @return {String} anchorKey
     */

  }, {
    key: 'anchorKey',
    get: function get() {
      return this.selection.anchorKey;
    }

    /**
     * Get the current focus key.
     *
     * @return {String} focusKey
     */

  }, {
    key: 'focusKey',
    get: function get() {
      return this.selection.focusKey;
    }

    /**
     * Get the current anchor offset.
     *
     * @return {String} anchorOffset
     */

  }, {
    key: 'anchorOffset',
    get: function get() {
      return this.selection.anchorOffset;
    }

    /**
     * Get the current focus offset.
     *
     * @return {String} focusOffset
     */

  }, {
    key: 'focusOffset',
    get: function get() {
      return this.selection.focusOffset;
    }

    /**
     * Get the current start text node's closest block parent.
     *
     * @return {Block} block
     */

  }, {
    key: 'startBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.startKey);
    }

    /**
     * Get the current end text node's closest block parent.
     *
     * @return {Block} block
     */

  }, {
    key: 'endBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.endKey);
    }

    /**
     * Get the current anchor text node's closest block parent.
     *
     * @return {Block} block
     */

  }, {
    key: 'anchorBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.anchorKey);
    }

    /**
     * Get the current focus text node's closest block parent.
     *
     * @return {Block} block
     */

  }, {
    key: 'focusBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.focusKey);
    }

    /**
     * Get the current start text node's closest inline parent.
     *
     * @return {Inline} inline
     */

  }, {
    key: 'startInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.startKey);
    }

    /**
     * Get the current end text node's closest inline parent.
     *
     * @return {Inline} inline
     */

  }, {
    key: 'endInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.endKey);
    }

    /**
     * Get the current anchor text node's closest inline parent.
     *
     * @return {Inline} inline
     */

  }, {
    key: 'anchorInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.anchorKey);
    }

    /**
     * Get the current focus text node's closest inline parent.
     *
     * @return {Inline} inline
     */

  }, {
    key: 'focusInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.focusKey);
    }

    /**
     * Get the current start text node.
     *
     * @return {Text} text
     */

  }, {
    key: 'startText',
    get: function get() {
      return this.document.getDescendant(this.selection.startKey);
    }

    /**
     * Get the current end node.
     *
     * @return {Text} text
     */

  }, {
    key: 'endText',
    get: function get() {
      return this.document.getDescendant(this.selection.endKey);
    }

    /**
     * Get the current anchor node.
     *
     * @return {Text} text
     */

  }, {
    key: 'anchorText',
    get: function get() {
      return this.document.getDescendant(this.selection.anchorKey);
    }

    /**
     * Get the current focus node.
     *
     * @return {Text} text
     */

  }, {
    key: 'focusText',
    get: function get() {
      return this.document.getDescendant(this.selection.focusKey);
    }

    /**
     * Get the characters in the current selection.
     *
     * @return {List} characters
     */

  }, {
    key: 'characters',
    get: function get() {
      return this.document.getCharactersAtRange(this.selection);
    }

    /**
     * Get the marks of the current selection.
     *
     * @return {Set} marks
     */

  }, {
    key: 'marks',
    get: function get() {
      return this.selection.marks || this.document.getMarksAtRange(this.selection);
    }

    /**
     * Get the block nodes in the current selection.
     *
     * @return {List} nodes
     */

  }, {
    key: 'blocks',
    get: function get() {
      return this.document.getBlocksAtRange(this.selection);
    }

    /**
     * Get the fragment of the current selection.
     *
     * @return {List} nodes
     */

  }, {
    key: 'fragment',
    get: function get() {
      return this.document.getFragmentAtRange(this.selection);
    }

    /**
     * Get the inline nodes in the current selection.
     *
     * @return {List} nodes
     */

  }, {
    key: 'inlines',
    get: function get() {
      return this.document.getInlinesAtRange(this.selection);
    }

    /**
     * Get the text nodes in the current selection.
     *
     * @return {List} nodes
     */

  }, {
    key: 'texts',
    get: function get() {
      return this.document.getTextsAtRange(this.selection);
    }
  }], [{
    key: 'create',


    /**
     * Create a new `State` with `properties`.
     *
     * @param {Object} properties
     * @return {State} state
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof State) return properties;

      var document = _document2.default.create(properties.document);
      var selection = _selection2.default.create(properties.selection).normalize(properties.document);

      return new State({ document: document, selection: selection });
    }
  }]);

  return State;
}(new _immutable.Record(DEFAULTS));

/**
 * Export.
 */

exports.default = State;