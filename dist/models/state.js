'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection7 = require('./selection');

var _selection8 = _interopRequireDefault(_selection7);

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// /**
//  * History.
//  */

// const History = new Record({
//   undos: new Stack(),
//   redos: new Stack()
// })

/**
 * Default properties.
 */

var DEFAULTS = {
  key: null,
  cursorMarks: null,
  document: new _document2.default(),
  selection: new _selection8.default(),
  // history: new History(),
  isNative: false
};

/**
 * State.
 */

var State = function (_ref) {
  _inherits(State, _ref);

  function State() {
    _classCallCheck(this, State);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(State).apply(this, arguments));
  }

  _createClass(State, [{
    key: 'transform',


    /**
     * Return a new `Transform` with the current state as a starting point.
     *
     * @return {Transform} transform
     */

    value: function transform() {
      var state = this;
      return new _transform2.default({ state: state });
    }

    /**
     * Add a `mark` to the characters in the current selection.
     *
     * @param {Mark} mark
     * @return {State} state
     */

  }, {
    key: 'addMark',
    value: function addMark(mark) {
      mark = normalizeMark(mark);
      var state = this;
      var _state = state;
      var cursorMarks = _state.cursorMarks;
      var document = _state.document;
      var selection = _state.selection;

      // If the selection is collapsed, add the mark to the cursor instead.

      if (selection.isCollapsed) {
        var marks = document.getMarksAtRange(selection);
        state = state.merge({ cursorMarks: marks.add(mark) });
        return state;
      }

      document = document.addMarkAtRange(selection, mark);
      state = state.merge({ document: document });
      return state;
    }

    /**
     * Move the selection to the start of the previous block.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToStartOfPreviousBlock',
    value: function collapseToStartOfPreviousBlock() {
      var state = this;
      var _state2 = state;
      var document = _state2.document;
      var selection = _state2.selection;

      var blocks = document.getBlocksAtRange(selection);
      var block = blocks.first();
      if (!block) return state;

      var previous = document.getPreviousBlock(block);
      if (!previous) return state;

      selection = selection.collapseToStartOf(previous);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the end of the previous block.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToEndOfPreviousBlock',
    value: function collapseToEndOfPreviousBlock() {
      var state = this;
      var _state3 = state;
      var document = _state3.document;
      var selection = _state3.selection;

      var blocks = document.getBlocksAtRange(selection);
      var block = blocks.first();
      if (!block) return state;

      var previous = document.getPreviousBlock(block);
      if (!previous) return state;

      selection = selection.collapseToEndOf(previous);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the start of the next block.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToStartOfNextBlock',
    value: function collapseToStartOfNextBlock() {
      var state = this;
      var _state4 = state;
      var document = _state4.document;
      var selection = _state4.selection;

      var blocks = document.getBlocksAtRange(selection);
      var block = blocks.last();
      if (!block) return state;

      var next = document.getNextBlock(block);
      if (!next) return state;

      selection = selection.collapseToStartOf(next);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the end of the next block.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToEndOfNextBlock',
    value: function collapseToEndOfNextBlock() {
      var state = this;
      var _state5 = state;
      var document = _state5.document;
      var selection = _state5.selection;

      var blocks = document.getBlocksAtRange(selection);
      var block = blocks.last();
      if (!block) return state;

      var next = document.getNextBlock(block);
      if (!next) return state;

      selection = selection.collapseToEndOf(next);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the start of the previous text.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToStartOfPreviousText',
    value: function collapseToStartOfPreviousText() {
      var state = this;
      var _state6 = state;
      var document = _state6.document;
      var selection = _state6.selection;

      var texts = document.getTextsAtRange(selection);
      var text = texts.first();
      if (!text) return state;

      var previous = document.getPreviousText(text);
      if (!previous) return state;

      selection = selection.collapseToStartOf(previous);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the end of the previous text.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToEndOfPreviousText',
    value: function collapseToEndOfPreviousText() {
      var state = this;
      var _state7 = state;
      var document = _state7.document;
      var selection = _state7.selection;

      var texts = document.getTextsAtRange(selection);
      var text = texts.first();
      if (!text) return state;

      var previous = document.getPreviousText(text);
      if (!previous) return state;

      selection = selection.collapseToEndOf(previous);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the start of the next text.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToStartOfNextText',
    value: function collapseToStartOfNextText() {
      var state = this;
      var _state8 = state;
      var document = _state8.document;
      var selection = _state8.selection;

      var texts = document.getTextsAtRange(selection);
      var text = texts.last();
      if (!text) return state;

      var next = document.getNextText(text);
      if (!next) return state;

      selection = selection.collapseToStartOf(next);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Move the selection to the end of the next text.
     *
     * @return {State} state
     */

  }, {
    key: 'collapseToEndOfNextText',
    value: function collapseToEndOfNextText() {
      var state = this;
      var _state9 = state;
      var document = _state9.document;
      var selection = _state9.selection;

      var texts = document.getTextsAtRange(selection);
      var text = texts.last();
      if (!text) return state;

      var next = document.getNextText(text);
      if (!next) return state;

      selection = selection.collapseToEndOf(next);
      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Delete at the current selection.
     *
     * @return {State} state
     */

  }, {
    key: 'delete',
    value: function _delete() {
      var state = this;
      var _state10 = state;
      var document = _state10.document;
      var selection = _state10.selection;

      var after = void 0;

      // When collapsed, there's nothing to do.
      if (selection.isCollapsed) return state;

      // Determine what the selection will be after deleting.
      var startText = this.startText;
      var _selection = selection;
      var startKey = _selection.startKey;
      var startOffset = _selection.startOffset;
      var endKey = _selection.endKey;
      var endOffset = _selection.endOffset;

      var block = document.getClosestBlock(startText);
      var highest = block.getHighestChild(startText);
      var previous = block.getPreviousSibling(highest);
      var next = block.getNextSibling(highest);

      if (previous && startOffset == 0 && (endKey != startKey || endOffset == startText.length)) {
        if (previous.kind == 'text') {
          if (next && next.kind == 'text') {
            after = selection.merge({
              anchorKey: previous.key,
              anchorOffset: previous.length,
              focusKey: previous.key,
              focusOffset: previous.length
            });
          } else {
            after = selection.collapseToEndOf(previous);
          }
        } else {
          var last = previous.getTexts().last();
          after = selection.collapseToEndOf(last);
        }
      } else {
        after = selection.collapseToStart();
      }

      // Delete and update the selection.
      document = document.deleteAtRange(selection);
      selection = after;
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Delete backward `n` characters at the current selection.
     *
     * @param {Number} n (optional)
     * @return {State} state
     */

  }, {
    key: 'deleteBackward',
    value: function deleteBackward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var state = this;
      var _state11 = state;
      var document = _state11.document;
      var selection = _state11.selection;

      var after = selection;

      // Determine what the selection should be after deleting.
      var _selection2 = selection;
      var startKey = _selection2.startKey;

      var startNode = document.getDescendant(startKey);

      if (selection.isExpanded) {
        after = selection.collapseToStart();
      } else if (selection.isAtStartOf(document)) {
        after = selection;
      } else if (selection.isAtStartOf(startNode)) {
        var previous = document.getPreviousText(startNode);
        var prevBlock = document.getClosestBlock(previous);
        var prevInline = document.getClosestInline(previous);

        if (prevBlock && prevBlock.isVoid) {
          after = selection;
        } else if (prevInline && prevInline.isVoid) {
          after = selection;
        } else {
          after = selection.collapseToEndOf(previous);
        }
      } else if (selection.isAtEndOf(startNode) && startNode.length == 1) {
        var block = document.getClosestBlock(startKey);
        var highest = block.getHighestChild(startKey);
        var _previous = block.getPreviousSibling(highest);
        var next = block.getNextSibling(highest);

        if (_previous) {
          if (_previous.kind == 'text') {
            if (next && next.kind == 'text') {
              after = selection.merge({
                anchorKey: _previous.key,
                anchorOffset: _previous.length,
                focusKey: _previous.key,
                focusOffset: _previous.length
              });
            } else {
              after = selection.collapseToEndOf(_previous);
            }
          } else {
            var last = _previous.getTexts().last();
            after = selection.collapseToEndOf(last);
          }
        } else {
          after = selection.moveBackward(n);
        }
      } else {
        after = selection.moveBackward(n);
      }

      // Delete backward and then update the selection.
      document = document.deleteBackwardAtRange(selection, n);
      selection = after;
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Delete forward `n` characters at the current selection.
     *
     * @param {Number} n (optional)
     * @return {State} state
     */

  }, {
    key: 'deleteForward',
    value: function deleteForward() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var state = this;
      var _state12 = state;
      var document = _state12.document;
      var selection = _state12.selection;
      var startText = _state12.startText;
      var _selection3 = selection;
      var startKey = _selection3.startKey;
      var startOffset = _selection3.startOffset;

      var after = selection;

      // Determine what the selection should be after deleting.
      var block = document.getClosestBlock(startKey);
      var inline = document.getClosestInline(startKey);
      var highest = block.getHighestChild(startKey);
      var previous = block.getPreviousSibling(highest);
      var next = block.getNextSibling(highest);

      if (selection.isExpanded) {
        after = selection.collapseToStart();
      } else if (block && block.isVoid || inline && inline.isVoid) {
        var nextText = document.getNextText(startKey);
        var prevText = document.getPreviousText(startKey);
        after = next ? selection.collapseToStartOf(nextText) : selection.collapseToEndOf(prevText);
      } else if (previous && startOffset == 0 && startText.length == 1) {
        if (previous.kind == 'text') {
          if (next && next.kind == 'text') {
            after = selection.merge({
              anchorKey: previous.key,
              anchorOffset: previous.length,
              focusKey: previous.key,
              focusOffset: previous.length
            });
          } else {
            after = selection.collapseToEndOf(previous);
          }
        } else {
          var last = previous.getTexts().last();
          after = selection.collapseToEndOf(last);
        }
      }

      // Delete forward and then update the selection.
      document = document.deleteForwardAtRange(selection, n);
      selection = after;
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Insert a `block` at the current selection.
     *
     * @param {String || Object || Block} block
     * @return {State} state
     */

  }, {
    key: 'insertBlock',
    value: function insertBlock(block) {
      var state = this;
      var _state13 = state;
      var document = _state13.document;
      var selection = _state13.selection;

      var after = selection;

      // Insert the block
      document = document.insertBlockAtRange(selection, block);

      // Determine what the selection should be after inserting.
      var keys = state.document.getTexts().map(function (text) {
        return text.key;
      });
      var text = document.getTexts().find(function (n) {
        return !keys.includes(n.key);
      });
      selection = selection.collapseToEndOf(text);

      // Update the document and selection.
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Insert a `fragment` at the current selection.
     *
     * @param {List} fragment
     * @return {State} state
     */

  }, {
    key: 'insertFragment',
    value: function insertFragment(fragment) {
      var state = this;
      var _state14 = state;
      var document = _state14.document;
      var selection = _state14.selection;

      var after = selection;

      // If there's nothing in the fragment, do nothing.
      if (!fragment.length) return state;

      // Lookup some nodes for determining the selection next.
      var texts = fragment.getTexts();
      var lastText = texts.last();
      var lastInline = fragment.getClosestInline(lastText);
      var startText = document.getDescendant(selection.startKey);
      var startBlock = document.getClosestBlock(startText);
      var startInline = document.getClosestInline(startText);
      var nextText = document.getNextText(startText);
      var nextBlock = nextText ? document.getClosestBlock(nextText) : null;
      var nextNextText = nextText ? document.getNextText(nextText) : null;

      var docTexts = document.getTexts();

      // Insert the fragment.
      document = document.insertFragmentAtRange(selection, fragment);

      // Determine what the selection should be after inserting.
      var keys = docTexts.map(function (text) {
        return text.key;
      });
      var text = document.getTexts().findLast(function (n) {
        return !keys.includes(n.key);
      });

      after = text ? selection.collapseToStartOf(text).moveForward(lastText.length) : selection.collapseToStart().moveForward(lastText.length);

      // Update the document and selection.
      selection = after;
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Insert a `text` string at the current selection.
     *
     * @param {String} text
     * @param {Set} marks (optional)
     * @return {State} state
     */

  }, {
    key: 'insertText',
    value: function insertText(text, marks) {
      var state = this;
      var _state15 = state;
      var cursorMarks = _state15.cursorMarks;
      var document = _state15.document;
      var selection = _state15.selection;

      var after = selection;

      // Determine what the selection should be after inserting.
      if (selection.isExpanded) {
        after = selection.collapseToStart().moveForward(text.length);
      } else {
        after = selection.moveForward(text.length);
      }

      // Insert the text and update the selection.
      document = document.insertTextAtRange(selection, text, marks || cursorMarks);
      selection = after;
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Move the selection to a specific anchor and focus point.
     *
     * @param {Object} properties
     * @return {State} state
     */

  }, {
    key: 'moveTo',
    value: function moveTo(properties) {
      var state = this;
      var _state16 = state;
      var document = _state16.document;
      var selection = _state16.selection;

      // Allow for passing a `Selection` object.

      if (properties instanceof _selection8.default) {
        properties = {
          anchorKey: properties.anchorKey,
          anchorOffset: properties.anchorOffset,
          focusKey: properties.focusKey,
          focusOffset: properties.focusOffset,
          isFocused: properties.isFocused
        };
      }

      // Pass in properties, and force `isBackward` to be re-resolved.
      selection = selection.merge(_extends({}, properties, {
        isBackward: null
      }));

      selection = selection.normalize(document);
      state = state.merge({ selection: selection });
      return state;
    }

    /**
     * Set `properties` of the block nodes in the current selection.
     *
     * @param {Object} properties
     * @return {State} state
     */

  }, {
    key: 'setBlock',
    value: function setBlock(properties) {
      var state = this;
      var _state17 = state;
      var document = _state17.document;
      var selection = _state17.selection;

      document = document.setBlockAtRange(selection, properties);
      state = state.merge({ document: document });
      return state;
    }

    /**
     * Set `properties` of the inline nodes in the current selection.
     *
     * @param {Object} properties
     * @return {State} state
     */

  }, {
    key: 'setInline',
    value: function setInline(properties) {
      var state = this;
      var _state18 = state;
      var document = _state18.document;
      var selection = _state18.selection;

      document = document.setInlineAtRange(selection, properties);
      state = state.merge({ document: document });
      return state;
    }

    /**
     * Split the block node at the current selection, to optional `depth`.
     *
     * @param {Number} depth (optional)
     * @return {State} state
     */

  }, {
    key: 'splitBlock',
    value: function splitBlock() {
      var depth = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var state = this;
      var _state19 = state;
      var document = _state19.document;
      var selection = _state19.selection;

      // Split the document.

      document = document.splitBlockAtRange(selection, depth);

      // Determine what the selection should be after splitting.
      var _selection4 = selection;
      var startKey = _selection4.startKey;

      var startNode = document.getDescendant(startKey);
      var nextNode = document.getNextText(startNode);
      selection = selection.collapseToStartOf(nextNode);

      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Split the inline nodes at the current selection, to optional `depth`.
     *
     * @param {Number} depth (optional)
     * @return {State} state
     */

  }, {
    key: 'splitInline',
    value: function splitInline() {
      var depth = arguments.length <= 0 || arguments[0] === undefined ? Infinity : arguments[0];

      var state = this;
      var _state20 = state;
      var document = _state20.document;
      var selection = _state20.selection;

      // Split the document.

      document = document.splitInlineAtRange(selection, depth);

      // Determine what the selection should be after splitting.
      var _selection5 = selection;
      var startKey = _selection5.startKey;

      var inlineParent = document.getClosestInline(startKey);

      if (inlineParent) {
        var startNode = document.getDescendant(startKey);
        var nextNode = document.getNextText(startNode);
        selection = selection.collapseToStartOf(nextNode);
      }

      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Remove a `mark` from the characters in the current selection.
     *
     * @param {Mark} mark
     * @return {State} state
     */

  }, {
    key: 'removeMark',
    value: function removeMark(mark) {
      mark = normalizeMark(mark);
      var state = this;
      var _state21 = state;
      var cursorMarks = _state21.cursorMarks;
      var document = _state21.document;
      var selection = _state21.selection;

      // If the selection is collapsed, remove the mark from the cursor instead.

      if (selection.isCollapsed) {
        var marks = document.getMarksAtRange(selection);
        state = state.merge({ cursorMarks: marks.remove(mark) });
        return state;
      }

      document = document.removeMarkAtRange(selection, mark);
      state = state.merge({ document: document });
      return state;
    }

    /**
     * Add or remove a `mark` from the characters in the current selection,
     * depending on whether it's already there.
     *
     * @param {Mark} mark
     * @return {State} state
     */

  }, {
    key: 'toggleMark',
    value: function toggleMark(mark) {
      mark = normalizeMark(mark);
      var state = this;
      var marks = state.marks;
      var document = state.document;
      var selection = state.selection;

      var exists = marks.some(function (m) {
        return m.equals(mark);
      });
      return exists ? state.removeMark(mark) : state.addMark(mark);
    }

    /**
     * Wrap the block nodes in the current selection with a new block node with
     * `properties`.
     *
     * @param {Object or String} properties
     * @return {State} state
     */

  }, {
    key: 'wrapBlock',
    value: function wrapBlock(properties) {
      var state = this;
      var _state22 = state;
      var document = _state22.document;
      var selection = _state22.selection;

      document = document.wrapBlockAtRange(selection, properties);
      state = state.merge({ document: document });
      return state;
    }

    /**
     * Unwrap the current selection from a block parent with `properties`.
     *
     * @param {Object or String} properties
     * @return {State} state
     */

  }, {
    key: 'unwrapBlock',
    value: function unwrapBlock(properties) {
      var state = this;
      var _state23 = state;
      var document = _state23.document;
      var selection = _state23.selection;

      document = document.unwrapBlockAtRange(selection, properties);
      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Wrap the current selection in new inline nodes with `properties`.
     *
     * @param {Object or String} properties
     * @return {State} state
     */

  }, {
    key: 'wrapInline',
    value: function wrapInline(properties) {
      var state = this;
      var _state24 = state;
      var document = _state24.document;
      var selection = _state24.selection;
      var _selection6 = selection;
      var startKey = _selection6.startKey;

      var previous = document.getPreviousText(startKey);

      document = document.wrapInlineAtRange(selection, properties);

      // Determine what the selection should be after wrapping.
      if (selection.isCollapsed) {
        selection = selection;
      } else if (selection.startOffset == 0) {
        var text = previous ? document.getNextText(previous) : document.getTexts().first();
        selection = selection.moveToRangeOf(text);
      } else {
        var _text = document.getNextText(selection.startKey);
        selection = selection.moveToRangeOf(_text);
      }

      state = state.merge({ document: document, selection: selection });
      return state;
    }

    /**
     * Unwrap the current selection from an inline parent with `properties`.
     *
     * @param {Object or String} properties
     * @return {State} state
     */

  }, {
    key: 'unwrapInline',
    value: function unwrapInline(properties) {
      var state = this;
      var _state25 = state;
      var document = _state25.document;
      var selection = _state25.selection;

      document = document.unwrapInlineAtRange(selection, properties);
      state = state.merge({ document: document, selection: selection });
      return state;
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
     * Is there undoable events?
     *
     * @return {Boolean} hasUndos
     */

  }, {
    key: 'hasUndos',
    get: function get() {
      return this.history.undos.size > 0;
    }

    /**
     * Is there redoable events?
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
      return this.cursorMarks || this.document.getMarksAtRange(this.selection);
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
      var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (properties instanceof State) return properties;
      properties.key = properties.key || (0, _uid2.default)(4);
      properties.document = _document2.default.create(properties.document);
      properties.selection = _selection8.default.create(properties.selection).normalize(properties.document);
      return new State(properties);
    }
  }]);

  return State;
}(new _immutable.Record(DEFAULTS));

/**
 * Normalize a `mark` argument, which can be a string or plain object too.
 *
 * @param {Mark or String or Object} mark
 * @return {Mark}
 */

function normalizeMark(mark) {
  if (typeof mark == 'string') {
    return _mark2.default.create({ type: mark });
  } else {
    return _mark2.default.create(mark);
  }
}

/**
 * Export.
 */

exports.default = State;