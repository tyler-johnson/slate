'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _placeholder = require('../components/placeholder');

var _placeholder2 = _interopRequireDefault(_placeholder);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The default plugin.
 *
 * @param {Object} options
 *   @property {Element} placeholder
 *   @property {String} placeholderClassName
 *   @property {Object} placeholderStyle
 * @return {Object}
 */

function Plugin() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var placeholder = options.placeholder;
  var placeholderClassName = options.placeholderClassName;
  var placeholderStyle = options.placeholderStyle;

  /**
   * The default block renderer.
   *
   * @param {Object} props
   * @return {Element}
   */

  function DEFAULT_BLOCK(props) {
    return _react2.default.createElement(
      'div',
      _extends({}, props.attributes, { style: { position: 'relative' } }),
      props.children,
      placeholder ? _react2.default.createElement(
        _placeholder2.default,
        {
          className: placeholderClassName,
          node: props.node,
          parent: props.state.document,
          state: props.state,
          style: placeholderStyle
        },
        placeholder
      ) : null
    );
  }

  /**
   * The default inline renderer.
   *
   * @param {Object} props
   * @return {Element}
   */

  function DEFAULT_INLINE(props) {
    return _react2.default.createElement(
      'span',
      _extends({}, props.attributes, { style: { position: 'relative' } }),
      props.children
    );
  }

  /**
   * On before input, see if we can let the browser continue with it's native
   * input behavior, to avoid a re-render for performance.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onBeforeInput(e, data, state, editor) {
    var renderDecorations = editor.renderDecorations;
    var startOffset = state.startOffset;
    var startText = state.startText;
    var startBlock = state.startBlock;

    // Determine what the characters would be if natively inserted.

    var prev = startText.getDecoratedCharacters(startBlock, renderDecorations);
    var char = prev.get(startOffset);
    var chars = prev.slice(0, startOffset).push(_character2.default.create({ text: e.data, marks: char && char.marks })).concat(prev.slice(startOffset));

    // Determine what the characters should be, if not natively inserted.
    var next = state.transform().insertText(e.data).apply();

    var nextText = next.startText;
    var nextBlock = next.startBlock;
    var nextChars = nextText.getDecoratedCharacters(nextBlock, renderDecorations);

    // We do not have to re-render if the current selection is collapsed, the
    // current node is not empty, there are no marks on the cursor, and the
    // natively inserted characters would be the same as the non-native.
    var isNative = state.isCollapsed && state.startText.text != '' && state.cursorMarks == null && chars.equals(nextChars);

    // Add the `isNative` flag directly, so we don't have to re-transform.
    if (isNative) {
      next = next.merge({ isNative: isNative });
    }

    // If not native, prevent default so that the DOM remains untouched.
    if (!isNative) e.preventDefault();

    // Return the new state.
    return next;
  }

  /**
   * On blur.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onBlur(e, data, state) {
    return state.transform().blur().apply({ isNative: true });
  }

  /**
   * On copy.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCopy(e, data, state) {
    onCutOrCopy(e, data, state);
  }

  /**
   * On cut.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onCut(e, data, state, editor) {
    onCutOrCopy(e, data, state);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      var next = editor.getState().transform().delete().apply();

      editor.onChange(next);
    });
  }

  /**
   * On cut or copy, create a fake selection so that we can add a Base 64
   * encoded copy of the fragment to the HTML, to decode on future pastes.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCutOrCopy(e, data, state) {
    var native = window.getSelection();
    if (!native.rangeCount) return;

    var fragment = data.fragment;

    var encoded = _base2.default.serializeNode(fragment);

    // Wrap the first character of the selection in a span that has the encoded
    // fragment attached as an attribute, so it will show up in the copied HTML.
    var range = native.getRangeAt(0);
    var contents = range.cloneContents();
    var wrapper = window.document.createElement('span');
    var text = contents.childNodes[0];
    var char = text.textContent.slice(0, 1);
    var first = window.document.createTextNode(char);
    var rest = text.textContent.slice(1);
    text.textContent = rest;
    wrapper.appendChild(first);
    wrapper.setAttribute('data-fragment', encoded);
    contents.insertBefore(wrapper, text);

    // Add the phony content to the DOM, and select it, so it will be copied.
    var body = window.document.querySelector('body');
    var div = window.document.createElement('div');
    div.setAttribute('contenteditable', true);
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.appendChild(contents);
    body.appendChild(div);

    // COMPAT: In Firefox, trying to use the terser `native.selectAllChildren`
    // throws an error, so we use the older `range` equivalent. (2016/06/21)
    var r = window.document.createRange();
    r.selectNodeContents(div);
    native.removeAllRanges();
    native.addRange(r);

    // Revert to the previous selection right after copying.
    window.requestAnimationFrame(function () {
      body.removeChild(div);
      native.removeAllRanges();
      native.addRange(range);
    });
  }

  /**
   * On drop.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDrop(e, data, state) {
    switch (data.type) {
      case 'text':
      case 'html':
        return onDropText(e, data, state);
      case 'fragment':
        return onDropFragment(e, data, state);
    }
  }

  /**
   * On drop fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropFragment(e, data, state) {
    var selection = state.selection;
    var fragment = data.fragment;
    var target = data.target;
    var isInternal = data.isInternal;

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.

    if (isInternal && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.moveBackward(selection.startKey == selection.endKey ? selection.endOffset - selection.startOffset : selection.endOffset);
    }

    var transform = state.transform();

    if (isInternal) transform = transform.delete();

    return transform.moveTo(target).insertFragment(fragment).apply();
  }

  /**
   * On drop text, split the blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropText(e, data, state) {
    var text = data.text;
    var target = data.target;

    var transform = state.transform().moveTo(target);

    text.split('\n').forEach(function (line, i) {
      if (i > 0) transform = transform.splitBlock();
      transform = transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On key down.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDown(e, data, state) {
    switch (data.key) {
      case 'enter':
        return onKeyDownEnter(e, data, state);
      case 'backspace':
        return onKeyDownBackspace(e, data, state);
      case 'delete':
        return onKeyDownDelete(e, data, state);
      case 'y':
        return onKeyDownY(e, data, state);
      case 'z':
        return onKeyDownZ(e, data, state);
    }
  }

  /**
   * On `enter` key down, split the current block in half.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownEnter(e, data, state) {
    var document = state.document;
    var startKey = state.startKey;
    var startBlock = state.startBlock;

    // For void blocks, we don't want to split. Instead we just move to the
    // start of the next text node if one exists.

    if (startBlock && startBlock.isVoid) {
      var text = document.getNextText(startKey);
      if (!text) return;
      return state.transform().collapseToStartOf(text).apply();
    }

    return state.transform().splitBlock().apply();
  }

  /**
   * On `backspace` key down, delete backwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownBackspace(e, data, state) {

    // If expanded, delete regularly.
    if (state.isExpanded) {
      return state.transform().delete().apply();
    }

    var startOffset = state.startOffset;
    var startBlock = state.startBlock;

    var text = startBlock.text;
    var n = void 0;

    // Determine how far backwards to delete.
    if (data.isWord) {
      n = _string2.default.getWordOffsetBackward(text, startOffset);
    } else if (data.isLine) {
      n = startOffset;
    } else {
      n = _string2.default.getCharOffsetBackward(text, startOffset);
    }

    return state.transform().deleteBackward(n).apply();
  }

  /**
   * On `delete` key down, delete forwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownDelete(e, data, state) {

    // If expanded, delete regularly.
    if (state.isExpanded) {
      return state.transform().delete().apply();
    }

    var startOffset = state.startOffset;
    var startBlock = state.startBlock;

    var text = startBlock.text;
    var n = void 0;

    // Determine how far forwards to delete.
    if (data.isWord) {
      n = _string2.default.getWordOffsetForward(text, startOffset);
    } else if (data.isLine) {
      n = text.length - startOffset;
    } else {
      n = _string2.default.getCharOffsetForward(text, startOffset);
    }

    return state.transform().deleteForward(n).apply();
  }

  /**
   * On `y` key down, redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownY(e, data, state) {
    if (!data.isMod) return;
    return state.transform().redo();
  }

  /**
   * On `z` key down, undo or redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownZ(e, data, state) {
    if (!data.isMod) return;
    return state.transform()[data.isShift ? 'redo' : 'undo']();
  }

  /**
   * On paste.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPaste(e, data, state) {
    switch (data.type) {
      case 'fragment':
        return onPasteFragment(e, data, state);
      case 'text':
      case 'html':
        return onPasteText(e, data, state);
    }
  }

  /**
   * On paste fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteFragment(e, data, state) {
    return state.transform().insertFragment(data.fragment).apply();
  }

  /**
   * On paste text, split blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteText(e, data, state) {
    var transform = state.transform();

    data.text.split('\n').forEach(function (line, i) {
      if (i > 0) transform = transform.splitBlock();
      transform = transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On select.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onSelect(e, data, state) {
    var selection = data.selection;

    return state.transform().moveTo(selection).focus().apply();
  }

  /**
   * The core `node` renderer, which uses plain `<div>` or `<span>` depending on
   * what kind of node it is.
   *
   * @param {Node} node
   * @return {Component} component
   */

  function renderNode(node) {
    return node.kind == 'block' ? DEFAULT_BLOCK : DEFAULT_INLINE;
  }

  /**
   * Return the core plugin.
   */

  return {
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onCopy: onCopy,
    onCut: onCut,
    onDrop: onDrop,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    renderNode: renderNode
  };
}

/**
 * Export.
 */

exports.default = Plugin;