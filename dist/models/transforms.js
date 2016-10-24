'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection = require('./selection');

var _selection2 = _interopRequireDefault(_selection);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * These are pulled out into their own file because they can get complex.
 */

var Transforms = {

  /**
   * Add a new `mark` to the characters at `range`.
   *
   * @param {Selection} range
   * @param {Mark or String or Object} mark
   * @return {Node} node
   */

  addMarkAtRange: function addMarkAtRange(range, mark) {
    mark = normalizeMark(mark);
    var node = this;

    // When the range is collapsed, do nothing.
    if (range.isCollapsed) return node;

    // Otherwise, find each of the text nodes within the range.
    var startKey = range.startKey;
    var startOffset = range.startOffset;
    var endKey = range.endKey;
    var endOffset = range.endOffset;

    var texts = node.getTextsAtRange(range);

    // Apply the mark to each of the text nodes's matching characters.
    texts = texts.map(function (text) {
      var characters = text.characters.map(function (char, i) {
        if (!isInRange(i, text, range)) return char;
        var marks = char.marks;

        marks = marks.add(mark);
        return char.merge({ marks: marks });
      });

      return text.merge({ characters: characters });
    });

    // Update each of the text nodes.
    texts.forEach(function (text) {
      node = node.updateDescendant(text);
    });

    return node;
  },


  /**
   * Delete everything in a `range`.
   *
   * @param {Selection} range
   * @return {Node} node
   */

  deleteAtRange: function deleteAtRange(range) {
    if (range.isCollapsed) return this;

    var node = this;

    // Make sure the children exist.
    var startKey = range.startKey;
    var startOffset = range.startOffset;
    var endKey = range.endKey;
    var endOffset = range.endOffset;

    node.assertDescendant(startKey);
    node.assertDescendant(endKey);

    // If the start and end nodes are the same, just remove characters.
    if (startKey == endKey) {
      var text = node.getDescendant(startKey);
      text = text.removeCharacters(startOffset, endOffset);
      node = node.updateDescendant(text);
      return node.normalize();
    }

    // Split the blocks and determine the edge boundaries.
    var start = range.collapseToStart();
    var end = range.collapseToEnd();
    var ancestor = node.getCommonAncestor(startKey, endKey);
    var isAncestor = ancestor == node;

    ancestor = ancestor.splitBlockAtRange(start, Infinity);
    ancestor = ancestor.splitBlockAtRange(end, Infinity);

    var startText = ancestor.getDescendant(startKey);
    var startEdgeText = ancestor.getNextText(startKey);

    var endText = ancestor.getNextText(endKey);
    var endEdgeText = ancestor.getDescendant(endKey);

    // Remove the new blocks inside the edges.
    var startEdgeBlock = ancestor.getFurthestBlock(startEdgeText);
    var endEdgeBlock = ancestor.getFurthestBlock(endEdgeText);

    var nodes = ancestor.nodes.takeUntil(function (n) {
      return n == startEdgeBlock;
    }).concat(ancestor.nodes.skipUntil(function (n) {
      return n == endEdgeBlock;
    }).rest());

    ancestor = ancestor.merge({ nodes: nodes });

    // Take the end edge's split text and move it to the start edge.
    var startBlock = ancestor.getClosestBlock(startText);
    var endChild = ancestor.getFurthestInline(endText) || endText;

    var startNodes = startBlock.nodes.push(endChild);
    startBlock = startBlock.merge({ nodes: startNodes });
    ancestor = ancestor.updateDescendant(startBlock);

    // While the end child is an only child, remove the block it's in.
    var endParent = ancestor.getClosestBlock(endChild);

    while (endParent && endParent.nodes.size == 1) {
      endChild = endParent;
      endParent = ancestor.getClosestBlock(endParent);
    }

    ancestor = ancestor.removeDescendant(endChild);

    // Update the node.
    node = isAncestor ? ancestor : node.updateDescendant(ancestor);

    // Normalize the adjacent text nodes.
    return node.normalize();
  },


  /**
   * Delete backward `n` characters at a `range`.
   *
   * @param {Selection} range
   * @param {Number} n (optional)
   * @return {Node} node
   */

  deleteBackwardAtRange: function deleteBackwardAtRange(range) {
    var n = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    var node = this;
    var _range = range;
    var startKey = _range.startKey;
    var startOffset = _range.startOffset;

    // When the range is still expanded, just do a regular delete.

    if (range.isExpanded) return node.deleteAtRange(range);

    // When collapsed at the start of the node, there's nothing to do.
    if (range.isAtStartOf(node)) return node;

    // When collapsed in a void node, remove that node.
    var block = node.getClosestBlock(startKey);
    if (block && block.isVoid) return node.removeDescendant(block);

    var inline = node.getClosestInline(startKey);
    if (inline && inline.isVoid) return node.removeDescendant(inline);

    // When at start of a text node, merge forwards into the next text node.
    var startNode = node.getDescendant(startKey);

    if (range.isAtStartOf(startNode)) {
      var previous = node.getPreviousText(startNode);

      // If the previous descendant is void, remove it.
      var prevBlock = node.getClosestBlock(previous);
      if (prevBlock && prevBlock.isVoid) return node.removeDescendant(prevBlock);

      var prevInline = node.getClosestInline(previous);
      if (prevInline && prevInline.isVoid) return node.removeDescendant(prevInline);

      range = range.extendToEndOf(previous);
      range = range.normalize(node);
      return node.deleteAtRange(range);
    }

    // Otherwise, remove `n` characters behind of the cursor.
    range = range.extendBackward(n);
    range = range.normalize(node);
    return node.deleteAtRange(range);
  },


  /**
   * Delete forward `n` characters at a `range`.
   *
   * @param {Selection} range
   * @param {Number} n (optional)
   * @return {Node} node
   */

  deleteForwardAtRange: function deleteForwardAtRange(range) {
    var n = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    var node = this;
    var _range2 = range;
    var startKey = _range2.startKey;

    // When the range is still expanded, just do a regular delete.

    if (range.isExpanded) return node.deleteAtRange(range);

    // When collapsed at the end of the node, there's nothing to do.
    if (range.isAtEndOf(node)) return node;

    // When collapsed in a void node, remove that node.
    var block = node.getClosestBlock(startKey);
    if (block && block.isVoid) return node.removeDescendant(block);

    var inline = node.getClosestInline(startKey);
    if (inline && inline.isVoid) return node.removeDescendant(inline);

    // When at end of a text node, merge forwards into the next text node.
    var startNode = node.getDescendant(startKey);
    if (range.isAtEndOf(startNode)) {
      var next = node.getNextText(startNode);
      range = range.extendToStartOf(next);
      range = range.normalize(node);
      return node.deleteAtRange(range);
    }

    // Otherwise, remove `n` characters ahead of the cursor.
    range = range.extendForward(n);
    range = range.normalize(node);
    return node.deleteAtRange(range);
  },


  /**
   * Insert a `block` node at `range`.
   *
   * @param {Selection} range
   * @param {Block or String or Object} block
   * @return {Node} node
   */

  insertBlockAtRange: function insertBlockAtRange(range, block) {
    block = normalizeBlock(block);
    var node = this;

    // If expanded, delete the range first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    var _range3 = range;
    var startKey = _range3.startKey;
    var startOffset = _range3.startOffset;

    var startBlock = node.getClosestBlock(startKey);
    var parent = node.getParent(startBlock);
    var nodes = _block2.default.createList([block]);
    var isParent = parent == node;

    // If the start block is void, insert after it.
    if (startBlock.isVoid) {
      parent = parent.insertChildrenAfter(startBlock, nodes);
    }

    // If the block is empty, replace it.
    else if (startBlock.isEmpty) {
        parent = parent.merge({ nodes: nodes });
      }

      // If the range is at the start of the block, insert before.
      else if (range.isAtStartOf(startBlock)) {
          nodes = nodes.concat(parent.nodes);
          parent = parent.merge({ nodes: nodes });
        }

        // If the range is at the end of the block, insert after.
        else if (range.isAtEndOf(startBlock)) {
            nodes = parent.nodes.concat(nodes);
            parent = parent.merge({ nodes: nodes });
          }

          // Otherwise, split the block and insert between.
          else {
              node = node.splitBlockAtRange(range);
              parent = node.getParent(startBlock);
              startBlock = node.getClosestBlock(startKey);
              nodes = parent.nodes.takeUntil(function (n) {
                return n == startBlock;
              }).push(startBlock).push(block).concat(parent.nodes.skipUntil(function (n) {
                return n == startBlock;
              }).rest());
              parent = parent.merge({ nodes: nodes });
            }

    node = isParent ? parent : node.updateDescendant(parent);

    return node.normalize();
  },


  /**
   * Insert a `fragment` at a `range`.
   *
   * @param {Selection} range
   * @param {List} fragment
   * @return {Node} node
   */

  insertFragmentAtRange: function insertFragmentAtRange(range, fragment) {
    range = range.normalize(this);
    var node = this;

    // If the range is expanded, delete first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    // If the fragment is empty, do nothing.
    if (!fragment.length) return node;

    // Make sure each node in the fragment has a unique key.
    fragment = fragment.mapDescendants(function (child) {
      return child.set('key', (0, _uid2.default)());
    });

    // Split the inlines if need be.
    if (!node.isInlineSplitAtRange(range)) {
      node = node.splitInlineAtRange(range);
    }

    // Determine the start and next children to insert into.
    var _range4 = range;
    var startKey = _range4.startKey;
    var endKey = _range4.endKey;

    var block = node.getClosestBlock(startKey);
    var start = node.getDescendant(startKey);
    var startChild = void 0;
    var nextChild = void 0;

    if (range.isAtStartOf(node)) {
      nextChild = node.getClosestBlock(node.getTexts().first());
    }

    if (range.isAtStartOf(block)) {
      nextChild = block.getHighestChild(block.getTexts().first());
    } else if (range.isAtStartOf(start)) {
      startChild = block.getHighestChild(block.getPreviousText(start));
      nextChild = block.getNextSibling(startChild);
    } else {
      startChild = block.getHighestChild(start);
      nextChild = block.getNextSibling(startChild);
    }

    // Get the first and last block of the fragment.
    var blocks = fragment.getBlocks();
    var firstBlock = blocks.first();
    var lastBlock = blocks.last();

    // If the block is empty, merge in the first block's type and data.
    if (block.length == 0) {
      block = block.merge({
        type: firstBlock.type,
        data: firstBlock.data
      });
    }

    // Insert the first blocks nodes into the starting block.
    if (startChild) {
      block = block.insertChildrenAfter(startChild, firstBlock.nodes);
    } else {
      block = block.insertChildrenBefore(nextChild, firstBlock.nodes);
    }

    node = node.updateDescendant(block);

    // If there are no other siblings, that's it.
    if (firstBlock == lastBlock) return node.normalize();

    // Otherwise, remove the fragment's first block's highest solo parent...
    var highestParent = fragment.getHighestOnlyChildParent(firstBlock);
    fragment = fragment.removeDescendant(highestParent || firstBlock);

    // Then, add the inlines after the cursor from the current block to the
    // start of the last block in the fragment.
    if (nextChild) {
      lastBlock = lastBlock.concatChildren(block.getChildrenAfterIncluding(nextChild));
      fragment = fragment.updateDescendant(lastBlock);

      block = block.removeChildrenAfterIncluding(nextChild);
      node = node.updateDescendant(block);
    }

    // Finally, add the fragment's children after the block.
    node = node.insertChildrenAfter(block, fragment.nodes);
    return node.normalize();
  },


  /**
   * Insert an `inline` node at `range`.
   *
   * @param {Selection} range
   * @param {Inline or String or Object} inline
   * @return {Node} node
   */

  insertInlineAtRange: function insertInlineAtRange(range, inline) {
    inline = normalizeInline(inline);
    var node = this;

    // If expanded, delete the range first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    var _range5 = range;
    var startKey = _range5.startKey;
    var endKey = _range5.endKey;
    var startOffset = _range5.startOffset;
    var endOffset = _range5.endOffset;

    // If the range is inside a void, abort.

    var startBlock = node.getClosestBlock(startKey);
    if (startBlock && startBlock.isVoid) return node;

    var startInline = node.getClosestInline(startKey);
    if (startInline && startInline.isVoid) return node;

    // Split the text nodes at the cursor.
    node = node.splitTextAtRange(range);

    // Insert the inline between the split text nodes.
    var startText = node.getDescendant(startKey);
    var parent = node.getParent(startKey);
    var nodes = parent.nodes.takeUntil(function (n) {
      return n == startText;
    }).push(startText).push(inline).concat(parent.nodes.skipUntil(function (n) {
      return n == startText;
    }).rest());

    parent = parent.merge({ nodes: nodes });
    node = node.updateDescendant(parent);
    return node.normalize();
  },


  /**
   * Insert text `string` at a `range`, with optional `marks`.
   *
   * @param {Selection} range
   * @param {String} string
   * @param {Set} marks (optional)
   * @return {Node} node
   */

  insertTextAtRange: function insertTextAtRange(range, string, marks) {
    var node = this;

    // When still expanded, remove the current range first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    // Insert text at the range's offset.
    var _range6 = range;
    var startKey = _range6.startKey;
    var startOffset = _range6.startOffset;

    var text = node.getDescendant(startKey);
    text = text.insertText(startOffset, string, marks);
    node = node.updateDescendant(text);

    return node;
  },


  /**
   * Remove an existing `mark` to the characters at `range`.
   *
   * @param {Selection} range
   * @param {Mark or String} mark (optional)
   * @return {Node} node
   */

  removeMarkAtRange: function removeMarkAtRange(range, mark) {
    mark = normalizeMark(mark);
    var node = this;

    // When the range is collapsed, do nothing.
    if (range.isCollapsed) return node;

    // Otherwise, find each of the text nodes within the range.
    var texts = node.getTextsAtRange(range);

    // Apply the mark to each of the text nodes's matching characters.
    texts = texts.map(function (text) {
      var characters = text.characters.map(function (char, i) {
        if (!isInRange(i, text, range)) return char;
        var marks = char.marks;

        marks = mark ? marks.remove(mark) : marks.clear();
        return char.merge({ marks: marks });
      });

      return text.merge({ characters: characters });
    });

    // Update each of the text nodes.
    texts.forEach(function (text) {
      node = node.updateDescendant(text);
    });

    return node;
  },


  /**
   * Remove a node by `key`.
   *
   * @param {String} key
   * @return {Node} node
   */

  removeNodeByKey: function removeNodeByKey(key) {
    return this.removeDescendant(key).normalize();
  },


  /**
   * Set the `properties` of block nodes in a `range`.
   *
   * @param {Selection} range
   * @param {Object or String} properties
   * @return {Node} node
   */

  setBlockAtRange: function setBlockAtRange(range) {
    var properties = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    properties = normalizeProperties(properties);
    var node = this;
    var blocks = node.getBlocksAtRange(range);

    blocks.forEach(function (block) {
      block = block.merge(properties);
      node = node.updateDescendant(block);
    });

    return node.normalize();
  },


  /**
   * Set the `properties` of inline nodes in a `range`.
   *
   * @param {Selection} range
   * @param {Object or String} properties
   * @return {Node} node
   */

  setInlineAtRange: function setInlineAtRange(range) {
    var properties = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    properties = normalizeProperties(properties);
    var node = this;
    var inlines = node.getInlinesAtRange(range);

    inlines.forEach(function (inline) {
      inline = inline.merge(properties);
      node = node.updateDescendant(inline);
    });

    return node.normalize();
  },


  /**
   * Set `properties` on a node by `key`.
   *
   * @param {String} key
   * @param {Object or String} properties
   * @return {Node} node
   */

  setNodeByKey: function setNodeByKey(key, properties) {
    properties = normalizeProperties(properties);
    var node = this;
    var descendant = node.assertDescendant(key);
    descendant = descendant.merge(properties);
    node = node.updateDescendant(descendant);
    return node;
  },


  /**
   * Split the block nodes at a `range`, to optional `depth`.
   *
   * @param {Selection} range
   * @param {Number} depth (optional)
   * @return {Node} node
   */

  splitBlockAtRange: function splitBlockAtRange(range) {
    var depth = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    var node = this;

    // If the range is expanded, remove it first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    // Split the inline nodes at the range.
    node = node.splitInlineAtRange(range);

    // Find the highest inline elements that were split.
    var _range7 = range;
    var startKey = _range7.startKey;

    var firstText = node.getDescendant(startKey);
    var secondText = node.getNextText(startKey);
    var firstChild = node.getFurthestInline(firstText) || firstText;
    var secondChild = node.getFurthestInline(secondText) || secondText;
    var parent = node.getClosestBlock(firstChild);
    var firstChildren = void 0;
    var secondChildren = void 0;
    var d = 0;

    // While the parent is a block, split the block nodes.
    while (parent && d < depth) {
      firstChildren = parent.nodes.takeUntil(function (n) {
        return n == firstChild;
      }).push(firstChild);
      secondChildren = parent.nodes.skipUntil(function (n) {
        return n == secondChild;
      });
      firstChild = parent.merge({ nodes: firstChildren });
      secondChild = _block2.default.create({
        nodes: secondChildren,
        type: parent.type,
        data: parent.data
      });

      // Add the new children.
      var grandparent = node.getParent(parent);
      var nodes = grandparent.nodes.takeUntil(function (n) {
        return n.key == firstChild.key;
      }).push(firstChild).push(secondChild).concat(grandparent.nodes.skipUntil(function (n) {
        return n.key == firstChild.key;
      }).rest());

      // Update the grandparent.
      node = grandparent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(grandparent.merge({ nodes: nodes }));

      d++;
      parent = node.getClosestBlock(firstChild);
    }

    return node;
  },


  /**
   * Split the inline nodes at a `range`, to optional `depth`.
   *
   * @param {Selection} range
   * @param {Number} depth (optiona)
   * @return {Node} node
   */

  splitInlineAtRange: function splitInlineAtRange(range) {
    var depth = arguments.length <= 1 || arguments[1] === undefined ? Infinity : arguments[1];

    var node = this;

    // If the range is expanded, remove it first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    // First split the text nodes.
    node = node.splitTextAtRange(range);

    // Find the children that were split.
    var _range8 = range;
    var startKey = _range8.startKey;

    var firstChild = node.getDescendant(startKey);
    var secondChild = node.getNextText(firstChild);
    var parent = node.getClosestInline(firstChild);
    var d = 0;

    // While the parent is an inline parent, split the inline nodes.
    while (parent && d < depth) {
      firstChild = parent.merge({ nodes: _inline2.default.createList([firstChild]) });
      secondChild = _inline2.default.create({
        nodes: [secondChild],
        type: parent.type,
        data: parent.data
      });

      // Split the children.
      var grandparent = node.getParent(parent);
      var nodes = grandparent.nodes.takeUntil(function (n) {
        return n.key == firstChild.key;
      }).push(firstChild).push(secondChild).concat(grandparent.nodes.skipUntil(function (n) {
        return n.key == firstChild.key;
      }).rest());

      // Update the grandparent.
      node = grandparent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(grandparent.merge({ nodes: nodes }));

      d++;
      parent = node.getClosestInline(firstChild);
    }

    return node;
  },


  /**
   * Split the text nodes at a `range`.
   *
   * @param {Selection} range
   * @return {Node} node
   */

  splitTextAtRange: function splitTextAtRange(range) {
    var node = this;

    // If the range is expanded, remove it first.
    if (range.isExpanded) {
      node = node.deleteAtRange(range);
      range = range.collapseToStart();
    }

    // Split the text node's characters.
    var _range9 = range;
    var startKey = _range9.startKey;
    var startOffset = _range9.startOffset;

    var text = node.getDescendant(startKey);
    var characters = text.characters;

    var firstChars = characters.take(startOffset);
    var secondChars = characters.skip(startOffset);
    var firstChild = text.merge({ characters: firstChars });
    var secondChild = _text2.default.create({ characters: secondChars });

    // Split the text nodes.
    var parent = node.getParent(text);
    var nodes = parent.nodes.takeUntil(function (c) {
      return c.key == firstChild.key;
    }).push(firstChild).push(secondChild).concat(parent.nodes.skipUntil(function (n) {
      return n.key == firstChild.key;
    }).rest());

    // Update the nodes.
    parent = parent.merge({ nodes: nodes });
    node = node.updateDescendant(parent);
    return node;
  },


  /**
   * Add or remove a `mark` from the characters at `range`, depending on whether
   * it's already there.
   *
   * @param {Selection} range
   * @param {Mark or String} mark (optional)
   * @return {Node} node
   */

  toggleMarkAtRange: function toggleMarkAtRange(range, mark) {
    mark = normalizeMark(mark);
    var node = this;

    // When the range is collapsed, do nothing.
    if (range.isCollapsed) return node;

    // Check if the mark exists in the range already.
    var marks = node.getMarksAtRange(range);
    var exists = marks.some(function (m) {
      return m.equals(mark);
    });

    return exists ? node.removeMarkAtRange(range, mark) : node.addMarkAtRange(range, mark);
  },


  /**
   * Unwrap all of the block nodes in a `range` from a block with `properties`.
   *
   * @param {Selection} range
   * @param {String or Object} properties
   * @return {Node} node
   */

  unwrapBlockAtRange: function unwrapBlockAtRange(range, properties) {
    properties = normalizeProperties(properties);
    var node = this;

    // Get the deepest blocks in the range.
    var blocks = node.getBlocksAtRange(range);

    // Get the matching wrapper blocks.
    var wrappers = blocks.reduce(function (memo, text) {
      var match = node.getClosest(text, function (parent) {
        if (parent.kind != 'block') return false;
        if (properties.type && parent.type != properties.type) return false;
        if (properties.data && !parent.data.isSuperset(properties.data)) return false;
        return true;
      });

      if (match) memo = memo.add(match);
      return memo;
    }, new _immutable.Set());

    // For each of the wrapper blocks...
    wrappers.forEach(function (wrapper) {
      var first = wrapper.nodes.first();
      var last = wrapper.nodes.last();
      var parent = node.getParent(wrapper);

      // Get the wrapped direct children.
      var children = wrapper.nodes.filter(function (child) {
        return blocks.some(function (block) {
          return child == block || child.hasDescendant(block);
        });
      });

      // Determine what the new nodes should be...
      var firstMatch = children.first();
      var lastMatch = children.last();
      var nodes = void 0;

      // If the first and last both match, remove the wrapper completely.
      if (first == firstMatch && last == lastMatch) {
        nodes = parent.nodes.takeUntil(function (n) {
          return n == wrapper;
        }).concat(wrapper.nodes).concat(parent.nodes.skipUntil(function (n) {
          return n == wrapper;
        }).rest());
      }

      // If only the last child matches, move the last nodes.
      else if (last == lastMatch) {
          var remain = wrapper.nodes.takeUntil(function (n) {
            return n == firstMatch;
          });
          var updated = wrapper.merge({ nodes: remain });
          nodes = parent.nodes.takeUntil(function (n) {
            return n == wrapper;
          }).push(updated).concat(children).concat(parent.nodes.skipUntil(function (n) {
            return n == wrapper;
          }).rest());
        }

        // If only the first child matches, move the first ones.
        else if (first == firstMatch) {
            var _remain = wrapper.nodes.skipUntil(function (n) {
              return n == lastMatch;
            }).rest();
            var _updated = wrapper.merge({ nodes: _remain });
            nodes = parent.nodes.takeUntil(function (n) {
              return n == wrapper;
            }).concat(children).push(_updated).concat(parent.nodes.skipUntil(function (n) {
              return n == wrapper;
            }).rest());
          }

          // Otherwise, move the middle ones.
          else {
              var firsts = wrapper.nodes.takeUntil(function (n) {
                return n == firstMatch;
              });
              var lasts = wrapper.nodes.skipUntil(function (n) {
                return n == lastMatch;
              }).rest();
              var updatedFirst = wrapper.merge({ nodes: firsts });
              var updatedLast = wrapper.merge({ nodes: lasts });
              nodes = parent.nodes.takeUntil(function (n) {
                return n == wrapper;
              }).push(updatedFirst).concat(children).push(updatedLast).concat(parent.nodes.skipUntil(function (n) {
                return n == wrapper;
              }).rest());
            }

      node = parent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(parent.merge({ nodes: nodes }));
    });

    return node.normalize();
  },


  /**
   * Unwrap the inline nodes in a `range` from an inline with `properties`.
   *
   * @param {Selection} range
   * @param {String or Object} properties
   * @return {Node} node
   */

  unwrapInlineAtRange: function unwrapInlineAtRange(range, properties) {
    properties = normalizeProperties(properties);
    var node = this;
    var blocks = node.getInlinesAtRange(range);

    // Find the closest matching inline wrappers of each text node.
    var texts = this.getTexts();
    var wrappers = texts.reduce(function (memo, text) {
      var match = node.getClosest(text, function (parent) {
        if (parent.kind != 'inline') return false;
        if (properties.type && parent.type != properties.type) return false;
        if (properties.data && !parent.data.isSuperset(properties.data)) return false;
        return true;
      });

      if (match) memo = memo.add(match);
      return memo;
    }, new _immutable.Set());

    // Replace each of the wrappers with their child nodes.
    wrappers.forEach(function (wrapper) {
      var parent = node.getParent(wrapper);

      // Replace the wrapper in the parent's nodes with the block.
      var nodes = parent.nodes.takeUntil(function (n) {
        return n == wrapper;
      }).concat(wrapper.nodes).concat(parent.nodes.skipUntil(function (n) {
        return n == wrapper;
      }).rest());

      // Update the parent.
      node = parent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(parent.merge({ nodes: nodes }));
    });

    return node.normalize();
  },


  /**
   * Wrap all of the blocks in a `range` in a new block with `properties`.
   *
   * @param {Selection} range
   * @param {String or Object} properties
   * @return {Node} node
   */

  wrapBlockAtRange: function wrapBlockAtRange(range, properties) {
    properties = normalizeProperties(properties);
    var node = this;

    // Get the block nodes, sorted by depth.
    var blocks = node.getBlocksAtRange(range);
    var sorted = blocks.sort(function (a, b) {
      var da = node.getDepth(a);
      var db = node.getDepth(b);
      if (da == db) return 0;else if (da > db) return -1;else return 1;
    });

    // Get the lowest common siblings, relative to the highest block.
    var highest = sorted.first();
    var depth = node.getDepth(highest);
    var siblings = blocks.reduce(function (memo, block) {
      var sibling = node.getDepth(block) == depth ? block : node.getClosest(block, function (p) {
        return node.getDepth(p) == depth;
      });
      memo = memo.push(sibling);
      return memo;
    }, _block2.default.createList());

    // Wrap the siblings in a new block.
    var wrapper = _block2.default.create({
      nodes: siblings,
      type: properties.type,
      data: properties.data
    });

    // Replace the siblings with the wrapper.
    var first = siblings.first();
    var last = siblings.last();
    var parent = node.getParent(highest);
    var nodes = parent.nodes.takeUntil(function (n) {
      return n == first;
    }).push(wrapper).concat(parent.nodes.skipUntil(function (n) {
      return n == last;
    }).rest());

    // Update the parent.
    node = parent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(parent.merge({ nodes: nodes }));

    return node;
  },


  /**
   * Wrap the text and inlines in a `range` in a new inline with `properties`.
   *
   * @param {Selection} range
   * @param {String or Object} properties
   * @return {Node} node
   */

  wrapInlineAtRange: function wrapInlineAtRange(range, properties) {
    properties = normalizeProperties(properties);
    var node = this;

    // If collapsed, there's nothing to wrap.
    if (range.isCollapsed) return node;

    // Split at the start of the range.
    var start = range.collapseToStart();
    node = node.splitInlineAtRange(start);

    // Determine the new end of the range, and split there.
    var _range10 = range;
    var startKey = _range10.startKey;
    var startOffset = _range10.startOffset;
    var endKey = _range10.endKey;
    var endOffset = _range10.endOffset;

    var firstNode = node.getDescendant(startKey);
    var nextNode = node.getNextText(startKey);
    var end = startKey != endKey ? range.collapseToEnd() : _selection2.default.create({
      anchorKey: nextNode.key,
      anchorOffset: endOffset - startOffset,
      focusKey: nextNode.key,
      focusOffset: endOffset - startOffset
    });

    node = node.splitInlineAtRange(end);

    // Calculate the new range to wrap around.
    var endNode = node.getDescendant(end.anchorKey);
    range = _selection2.default.create({
      anchorKey: nextNode.key,
      anchorOffset: 0,
      focusKey: endNode.key,
      focusOffset: endNode.length
    });

    // Get the furthest inline nodes in the range.
    var texts = node.getTextsAtRange(range);
    var children = texts.map(function (text) {
      return node.getFurthestInline(text) || text;
    });

    // Iterate each of the child nodes, wrapping them.
    children.forEach(function (child) {
      var wrapper = _inline2.default.create({
        nodes: [child],
        type: properties.type,
        data: properties.data
      });

      // Replace the child in it's parent with the wrapper.
      var parent = node.getParent(child);
      var nodes = parent.nodes.takeUntil(function (n) {
        return n == child;
      }).push(wrapper).concat(parent.nodes.skipUntil(function (n) {
        return n == child;
      }).rest());

      // Update the parent.
      node = parent == node ? node.merge({ nodes: nodes }) : node.updateDescendant(parent.merge({ nodes: nodes }));
    });

    return node.normalize();
  }
};

/**
 * Check if an `index` of a `text` node is in a `range`.
 *
 * @param {Number} index
 * @param {Text} text
 * @param {Selection} range
 * @return {Set} characters
 */

function isInRange(index, text, range) {
  var startKey = range.startKey;
  var startOffset = range.startOffset;
  var endKey = range.endKey;
  var endOffset = range.endOffset;

  var matcher = void 0;

  if (text.key == startKey && text.key == endKey) {
    return startOffset <= index && index < endOffset;
  } else if (text.key == startKey) {
    return startOffset <= index;
  } else if (text.key == endKey) {
    return index < endOffset;
  } else {
    return true;
  }
}

/**
 * Normalize a `mark` argument, which can be a string or plain object too.
 *
 * @param {Mark or String or Object} mark
 * @return {Mark}
 */

function normalizeMark(mark) {
  if (mark instanceof _mark2.default) return mark;

  var type = (0, _typeOf2.default)(mark);

  switch (type) {
    case 'string':
    case 'object':
      {
        return _mark2.default.create(normalizeProperties(mark));
      }
    default:
      {
        throw new Error('A `mark` argument must be a mark, an object or a string, but you passed: "' + type + '".');
      }
  }
}

/**
 * Normalize a `block` argument, which can be a string or plain object too.
 *
 * @param {Block or String or Object} block
 * @return {Block}
 */

function normalizeBlock(block) {
  if (block instanceof _block2.default) return block;

  var type = (0, _typeOf2.default)(block);

  switch (type) {
    case 'string':
    case 'object':
      {
        return _block2.default.create(normalizeProperties(block));
      }
    default:
      {
        throw new Error('A `block` argument must be a block, an object or a string, but you passed: "' + type + '".');
      }
  }
}

/**
 * Normalize an `inline` argument, which can be a string or plain object too.
 *
 * @param {Inline or String or Object} inline
 * @return {Inline}
 */

function normalizeInline(inline) {
  if (inline instanceof _inline2.default) return inline;

  var type = (0, _typeOf2.default)(inline);

  switch (type) {
    case 'string':
    case 'object':
      {
        return _inline2.default.create(normalizeProperties(inline));
      }
    default:
      {
        throw new Error('An `inline` argument must be an inline, an object or a string, but you passed: "' + type + '".');
      }
  }
}

/**
 * Normalize the `properties` of a node or mark, which can be either a type
 * string or a dictionary of properties. If it's a dictionary, `data` is
 * optional and shouldn't be set if null or undefined.
 *
 * @param {String or Object} properties
 * @return {Object}
 */

function normalizeProperties() {
  var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var ret = {};
  var type = (0, _typeOf2.default)(properties);

  switch (type) {
    case 'string':
      {
        ret.type = properties;
        break;
      }
    case 'object':
      {
        for (var key in properties) {
          if (key == 'data') {
            if (properties[key] != null) ret[key] = _data2.default.create(properties[key]);
          } else {
            ret[key] = properties[key];
          }
        }
        break;
      }
    default:
      {
        throw new Error('A `properties` argument must be an object or a string, but you passed: "' + type + '".');
      }
  }

  return ret;
}

/**
 * Export.
 */

exports.default = Transforms;