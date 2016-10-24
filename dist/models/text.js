'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Range.
 */

var Range = new _immutable.Record({
  kind: 'range',
  marks: new _immutable.Set(),
  text: ''
});

/**
 * Default properties.
 */

var DEFAULTS = {
  characters: new _immutable.List(),
  key: null
};

/**
 * Text.
 */

var Text = function (_ref) {
  _inherits(Text, _ref);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Text).apply(this, arguments));
  }

  _createClass(Text, [{
    key: 'getDecoratedCharacters',


    /**
     * Get the decorated characters.
     *
     * @param {Block} block
     * @param {Function} decorator
     * @return {List} characters
     */

    value: function getDecoratedCharacters(block, decorator) {
      return decorator(this, block);
    }

    /**
     * Get the decorated characters grouped by marks.
     *
     * @param {Block} block
     * @param {Function} decorator
     * @return {List} ranges
     */

  }, {
    key: 'getDecoratedRanges',
    value: function getDecoratedRanges(block, decorator) {
      var decorations = this.getDecoratedCharacters(block, decorator);
      return this.getRangesForCharacters(decorations);
    }

    /**
     * Get the characters grouped by marks.
     *
     * @return {List} ranges
     */

  }, {
    key: 'getRanges',
    value: function getRanges() {
      return this.getRangesForCharacters(this.characters);
    }

    /**
     * Derive the ranges for a list of `characters`.
     *
     * @param {List} characters
     * @return {List}
     */

  }, {
    key: 'getRangesForCharacters',
    value: function getRangesForCharacters(characters) {
      if (characters.size == 0) {
        var ranges = new _immutable.List();
        ranges = ranges.push(new Range());
        return ranges;
      }

      return characters.toList().reduce(function (ranges, char, i) {
        var marks = char.marks;
        var text = char.text;

        // The first one can always just be created.

        if (i == 0) {
          return ranges.push(new Range({ text: text, marks: marks }));
        }

        // Otherwise, compare to the previous and see if a new range should be
        // created, or whether the text should be added to the previous range.
        var previous = characters.get(i - 1);
        var prevMarks = previous.marks;
        var added = marks.filterNot(function (mark) {
          return prevMarks.includes(mark);
        });
        var removed = prevMarks.filterNot(function (mark) {
          return marks.includes(mark);
        });
        var isSame = !added.size && !removed.size;

        // If the marks are the same, add the text to the previous range.
        if (isSame) {
          var index = ranges.size - 1;
          var prevRange = ranges.get(index);
          var prevText = prevRange.get('text');
          prevRange = prevRange.set('text', prevText += text);
          return ranges.set(index, prevRange);
        }

        // Otherwise, create a new range.
        return ranges.push(new Range({ text: text, marks: marks }));
      }, new _immutable.List());
    }

    /**
     * Remove characters from the text node from `start` to `end`.
     *
     * @param {Number} start
     * @param {Number} end
     * @return {Text} text
     */

  }, {
    key: 'removeCharacters',
    value: function removeCharacters(start, end) {
      var characters = this.characters;


      characters = characters.filterNot(function (char, i) {
        return start <= i && i < end;
      });

      return this.merge({ characters: characters });
    }

    /**
     * Insert text `string` at `index`.
     *
     * @param {Numbder} index
     * @param {String} string
     * @param {String} marks (optional)
     * @return {Text} text
     */

  }, {
    key: 'insertText',
    value: function insertText(index, string, marks) {
      var characters = this.characters;


      if (!marks) {
        var prev = index ? characters.get(index - 1) : null;
        marks = prev ? prev.marks : _mark2.default.createSet();
      }

      var chars = _character2.default.createList(string.split('').map(function (char) {
        return {
          text: char,
          marks: marks
        };
      }));

      characters = characters.slice(0, index).concat(chars).concat(characters.slice(index));

      return this.merge({ characters: characters });
    }
  }, {
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String} kind
     */

    get: function get() {
      return 'text';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean} isEmpty
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the node.
     *
     * @return {Number} length
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text of the node.
     *
     * @return {String} text
     */

  }, {
    key: 'text',
    get: function get() {
      return this.characters.map(function (char) {
        return char.text;
      }).join('');
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Text` with `properties`.
     *
     * @param {Object} properties
     * @return {Text} text
     */

    value: function create() {
      var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (properties instanceof Text) return properties;
      properties.key = properties.key || (0, _uid2.default)(4);
      properties.characters = _character2.default.createList(properties.characters);
      return new Text(properties);
    }

    /**
     * Create a list of `Texts` from an array.
     *
     * @param {Array} elements
     * @return {List} map
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Text.create));
    }
  }]);

  return Text;
}(new _immutable.Record(DEFAULTS));

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Text.prototype, ['getDecoratedCharacters', 'getDecoratedRanges', 'getRanges', 'getRangesForCharacters']);

/**
 * Export.
 */

exports.default = Text;