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

var _transforms = require('./transforms');

var _transforms2 = _interopRequireDefault(_transforms);

var _text2 = require('./text');

var _text3 = _interopRequireDefault(_text2);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 */

var Node = {

  /**
   * Assert that a node has a child by `key` and return it.
   *
   * @param {String or Node} key
   * @return {Node}
   */

  assertChild: function assertChild(key) {
    var child = this.getChild(key);

    if (!child) {
      key = normalizeKey(key);
      throw new Error('Could not find a child node with key "' + key + '".');
    }

    return child;
  },


  /**
   * Assert that a node has a descendant by `key` and return it.
   *
   * @param {String or Node} key
   * @return {Node}
   */

  assertDescendant: function assertDescendant(key) {
    var descendant = this.getDescendant(key);

    if (!descendant) {
      key = normalizeKey(key);
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    return descendant;
  },


  /**
   * Concat children `nodes` on to the end of the node.
   *
   * @param {List} nodes
   * @return {Node} node
   */

  concatChildren: function concatChildren(nodes) {
    nodes = this.nodes.concat(nodes);
    return this.merge({ nodes: nodes });
  },


  /**
   * Decorate all of the text nodes with a `decorator` function.
   *
   * @param {Function} decorator
   * @return {Node} node
   */

  decorateTexts: function decorateTexts(decorator) {
    return this.mapDescendants(function (child) {
      return child.kind == 'text' ? child.decorateCharacters(decorator) : child;
    });
  },


  /**
   * Recursively find all ancestor nodes by `iterator`.
   *
   * @param {Function} iterator
   * @return {Node} node
   */

  findDescendant: function findDescendant(iterator) {
    return this.nodes.find(iterator) || this.nodes.map(function (node) {
      return node.kind == 'text' ? null : node.findDescendant(iterator);
    }).find(function (exists) {
      return exists;
    });
  },


  /**
   * Recursively filter all ancestor nodes with `iterator`.
   *
   * @param {Function} iterator
   * @return {List} nodes
   */

  filterDescendants: function filterDescendants(iterator) {
    return this.nodes.reduce(function (matches, child, i, nodes) {
      if (iterator(child, i, nodes)) matches = matches.push(child);
      if (child.kind != 'text') matches = matches.concat(child.filterDescendants(iterator));
      return matches;
    }, _block2.default.createList());
  },


  /**
   * Get the closest block nodes for each text node in the node.
   *
   * @return {List} nodes
   */

  getBlocks: function getBlocks() {
    var _this = this;

    return this.getTexts().map(function (text) {
      return _this.getClosestBlock(text);
    }).toSet().toList();
  },


  /**
   * Get the closest block nodes for each text node in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getBlocksAtRange: function getBlocksAtRange(range) {
    var _this2 = this;

    return this.getTextsAtRange(range).map(function (text) {
      return _this2.getClosestBlock(text);
    });
  },


  /**
   * Get a list of the characters in a `range`.
   *
   * @param {Selection} range
   * @return {List} characters
   */

  getCharactersAtRange: function getCharactersAtRange(range) {
    return this.getTextsAtRange(range).reduce(function (characters, text) {
      var chars = text.characters.filter(function (char, i) {
        return isInRange(i, text, range);
      });
      return characters.concat(chars);
    }, _character2.default.createList());
  },


  /**
   * Get children after a child by `key`.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenAfter: function getChildrenAfter(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(index + 1);
  },


  /**
   * Get children after a child by `key`, including the child.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenAfterIncluding: function getChildrenAfterIncluding(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(index);
  },


  /**
   * Get children before a child by `key`.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenBefore: function getChildrenBefore(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(0, index);
  },


  /**
   * Get children before a child by `key`, including the child.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  getChildrenBeforeIncluding: function getChildrenBeforeIncluding(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    return this.nodes.slice(0, index + 1);
  },


  /**
   * Get children between two child keys.
   *
   * @param {String or Node} start
   * @param {String or Node} end
   * @return {Node} node
   */

  getChildrenBetween: function getChildrenBetween(start, end) {
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start + 1, end);
  },


  /**
   * Get children between two child keys, including the two children.
   *
   * @param {String or Node} start
   * @param {String or Node} end
   * @return {Node} node
   */

  getChildrenBetweenIncluding: function getChildrenBetweenIncluding(start, end) {
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start, end + 1);
  },


  /**
   * Get closest parent of node by `key` that matches `iterator`.
   *
   * @param {String or Node} key
   * @param {Function} iterator
   * @return {Node or Null} node
   */

  getClosest: function getClosest(key, iterator) {
    var node = this.assertDescendant(key);

    while (node = this.getParent(node)) {
      if (node == this) return null;
      if (iterator(node)) return node;
    }

    return null;
  },


  /**
   * Get the closest block parent of a `node`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getClosestBlock: function getClosestBlock(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'block';
    });
  },


  /**
   * Get the closest inline parent of a `node`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getClosestInline: function getClosestInline(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'inline';
    });
  },


  /**
   * Get a child node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getChild: function getChild(key) {
    key = normalizeKey(key);
    return this.nodes.find(function (node) {
      return node.key == key;
    });
  },


  /**
   * Get the common ancestor of nodes `one` and `two` by keys.
   *
   * @param {String or Node} one
   * @param {String or Node} two
   * @return {Node}
   */

  getCommonAncestor: function getCommonAncestor(one, two) {
    this.assertDescendant(one);
    this.assertDescendant(two);
    var ancestors = new _immutable.List();
    var oneParent = this.getParent(one);
    var twoParent = this.getParent(two);

    while (oneParent) {
      ancestors = ancestors.push(oneParent);
      oneParent = this.getParent(oneParent);
    }

    while (twoParent) {
      if (ancestors.includes(twoParent)) return twoParent;
      twoParent = this.getParent(twoParent);
    }
  },


  /**
   * Get a descendant node by `key`.
   *
   * @param {String} key
   * @return {Node or Null} node
   */

  getDescendant: function getDescendant(key) {
    key = normalizeKey(key);

    var child = this.getChild(key);
    if (child) return child;

    this.nodes.find(function (node) {
      if (node.kind == 'text') return false;
      child = node.getDescendant(key);
      return child;
    });

    return child;
  },


  /**
   * Get the depth of a child node by `key`, with optional `startAt`.
   *
   * @param {String or Node} key
   * @param {Number} startAt (optional)
   * @return {Number} depth
   */

  getDepth: function getDepth(key) {
    var startAt = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    this.assertDescendant(key);
    return this.hasChild(key) ? startAt : this.getHighestChild(key).getDepth(key, startAt + 1);
  },


  /**
   * Get a fragment of the node at a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getFragmentAtRange: function getFragmentAtRange(range) {
    var node = this;
    var nodes = _block2.default.createList();

    // If the range is collapsed, there's nothing to do.
    if (range.isCollapsed) return _document2.default.create({ nodes: nodes });

    // Make sure the children exist.
    var startKey = range.startKey;
    var startOffset = range.startOffset;
    var endKey = range.endKey;
    var endOffset = range.endOffset;

    node.assertDescendant(startKey);
    node.assertDescendant(endKey);

    // Split at the start and end.
    var start = range.collapseToStart();
    node = node.splitBlockAtRange(start, Infinity);

    var next = node.getNextText(startKey);
    var end = startKey == endKey ? range.collapseToStartOf(next).moveForward(endOffset - startOffset) : range.collapseToEnd();
    node = node.splitBlockAtRange(end, Infinity);

    // Get the start and end nodes.
    var startNode = node.getNextSibling(node.getHighestChild(startKey));
    var endNode = startKey == endKey ? node.getHighestChild(next) : node.getHighestChild(endKey);

    nodes = node.getChildrenBetweenIncluding(startNode, endNode);

    // Return a new document fragment.
    return _document2.default.create({ nodes: nodes });
  },


  /**
   * Get the furthest parent of a node by `key` that matches an `iterator`.
   *
   * @param {String or Node} key
   * @param {Function} iterator
   * @return {Node or Null}
   */

  getFurthest: function getFurthest(key, iterator) {
    var node = this.assertDescendant(key);
    var furthest = null;

    while (node = this.getClosest(node, iterator)) {
      furthest = node;
    }

    return furthest;
  },


  /**
   * Get the furthest block parent of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getFurthestBlock: function getFurthestBlock(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'block';
    });
  },


  /**
   * Get the furthest inline parent of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getFurthestInline: function getFurthestInline(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'inline';
    });
  },


  /**
   * Get the highest child ancestor of a node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getHighestChild: function getHighestChild(key) {
    key = normalizeKey(key);
    return this.nodes.find(function (node) {
      if (node.key == key) return true;
      if (node.kind == 'text') return false;
      return node.hasDescendant(key);
    });
  },


  /**
   * Get the highest parent of a node by `key` which has an only child.
   *
   * @param {String or Node} key
   * @return {Node or Null}
   */

  getHighestOnlyChildParent: function getHighestOnlyChildParent(key) {
    var child = this.assertChild(key);
    var match = null;
    var parent = void 0;

    while (parent = this.getParent(child)) {
      if (parent == null || parent.nodes.size > 1) return match;
      match = parent;
      child = parent;
    }
  },


  /**
   * Get the furthest inline nodes for each text node in the node.
   *
   * @return {List} nodes
   */

  getInlines: function getInlines() {
    var _this3 = this;

    return this.getTexts().map(function (text) {
      return _this3.getFurthestInline(text);
    }).filter(function (exists) {
      return exists;
    }).toSet().toList();
  },


  /**
   * Get the closest inline nodes for each text node in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getInlinesAtRange: function getInlinesAtRange(range) {
    var _this4 = this;

    return this.getTextsAtRange(range).map(function (text) {
      return _this4.getClosestInline(text);
    }).filter(function (exists) {
      return exists;
    }).toSet().toList();
  },


  /**
   * Get a set of the marks in a `range`.
   *
   * @param {Selection} range
   * @return {Set} marks
   */

  getMarksAtRange: function getMarksAtRange(range) {
    range = range.normalize(this);
    var _range = range;
    var startKey = _range.startKey;
    var startOffset = _range.startOffset;

    var marks = _mark2.default.createSet();

    // If the range is collapsed at the start of the node, check the previous.
    if (range.isCollapsed && startOffset == 0) {
      var text = this.getDescendant(startKey);
      var previous = this.getPreviousText(startKey);
      if (!previous || !previous.length) return marks;
      var char = previous.characters.get(previous.length - 1);
      return char.marks;
    }

    // If the range is collapsed, check the character before the start.
    if (range.isCollapsed) {
      var _text = this.getDescendant(startKey);
      var _char = _text.characters.get(range.startOffset - 1);
      return _char.marks;
    }

    // Otherwise, get a set of the marks for each character in the range.
    return this.getCharactersAtRange(range).reduce(function (memo, char) {
      return memo.union(char.marks);
    }, new _immutable.Set());
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextBlock: function getNextBlock(key) {
    var child = this.assertDescendant(key);
    var last = void 0;

    if (child.kind == 'block') {
      last = child.getTexts().last();
    } else {
      var block = this.getClosestBlock(key);
      last = block.getTexts().last();
    }

    var next = this.getNextText(last);
    if (!next) return null;

    return this.getClosestBlock(next);
  },


  /**
   * Get the node after a descendant by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextSibling: function getNextSibling(key) {
    var node = this.assertDescendant(key);
    return this.getParent(node).nodes.skipUntil(function (child) {
      return child == node;
    }).get(1);
  },


  /**
   * Get the text node after a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getNextText: function getNextText(key) {
    key = normalizeKey(key);
    return this.getTexts().skipUntil(function (text) {
      return text.key == key;
    }).get(1);
  },


  /**
   * Get the offset for a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Number} offset
   */

  getOffset: function getOffset(key) {
    this.assertDescendant(key);

    // Calculate the offset of the nodes before the highest child.
    var child = this.getHighestChild(key);
    var offset = this.nodes.takeUntil(function (n) {
      return n == child;
    }).reduce(function (memo, n) {
      return memo + n.length;
    }, 0);

    // Recurse if need be.
    return this.hasChild(key) ? offset : offset + child.getOffset(key);
  },


  /**
   * Get the offset from a `range`.
   *
   * @param {Selection} range
   * @return {Number} offset
   */

  getOffsetAtRange: function getOffsetAtRange(range) {
    range = range.normalize(this);

    if (range.isExpanded) {
      throw new Error('The range must be collapsed to calculcate its offset.');
    }

    var _range2 = range;
    var startKey = _range2.startKey;
    var startOffset = _range2.startOffset;

    return this.getOffset(startKey) + startOffset;
  },


  /**
   * Get the parent of a child node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getParent: function getParent(key) {
    if (this.hasChild(key)) return this;

    var node = null;

    this.nodes.forEach(function (child) {
      if (child.kind == 'text') return;
      var match = child.getParent(key);
      if (match) node = match;
    });

    return node;
  },


  /**
   * Get the node before a descendant node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousSibling: function getPreviousSibling(key) {
    var node = this.assertDescendant(key);
    return this.getParent(node).nodes.takeUntil(function (child) {
      return child == node;
    }).last();
  },


  /**
   * Get the text node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousText: function getPreviousText(key) {
    key = normalizeKey(key);
    return this.getTexts().takeUntil(function (text) {
      return text.key == key;
    }).last();
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String or Node} key
   * @return {Node or Null} node
   */

  getPreviousBlock: function getPreviousBlock(key) {
    var child = this.assertDescendant(key);
    var first = void 0;

    if (child.kind == 'block') {
      first = child.getTexts().first();
    } else {
      var block = this.getClosestBlock(key);
      first = block.getTexts().first();
    }

    var previous = this.getPreviousText(first);
    if (!previous) return null;

    return this.getClosestBlock(previous);
  },


  /**
   * Get the descendent text node at an `offset`.
   *
   * @param {String} offset
   * @return {Node or Null} node
   */

  getTextAtOffset: function getTextAtOffset(offset) {
    var length = 0;
    return this.getTexts().find(function (text) {
      length += text.length;
      return length >= offset;
    });
  },


  /**
   * Recursively get all of the child text nodes in order of appearance.
   *
   * @return {List} nodes
   */

  getTexts: function getTexts() {
    return this.nodes.reduce(function (texts, node) {
      return node.kind == 'text' ? texts.push(node) : texts.concat(node.getTexts());
    }, _block2.default.createList());
  },


  /**
   * Get all of the text nodes in a `range`.
   *
   * @param {Selection} range
   * @return {List} nodes
   */

  getTextsAtRange: function getTextsAtRange(range) {
    range = range.normalize(this);
    var _range3 = range;
    var startKey = _range3.startKey;
    var endKey = _range3.endKey;

    var texts = this.getTexts();
    var startText = this.getDescendant(startKey);
    var endText = this.getDescendant(endKey);
    var start = texts.indexOf(startText);
    var end = texts.indexOf(endText);
    return texts.slice(start, end + 1);
  },


  /**
   * Check if a child node exists by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean} exists
   */

  hasChild: function hasChild(key) {
    return !!this.getChild(key);
  },


  /**
   * Recursively check if a child node exists by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean} exists
   */

  hasDescendant: function hasDescendant(key) {
    return !!this.getDescendant(key);
  },


  /**
   * Check if a node has a void parent by `key`.
   *
   * @param {String or Node} key
   * @return {Boolean}
   */

  hasVoidParent: function hasVoidParent(key) {
    return !!this.getClosest(key, function (parent) {
      return parent.isVoid;
    });
  },


  /**
   * Insert child `nodes` after child by `key`.
   *
   * @param {String or Node} key
   * @param {List} nodes
   * @return {Node} node
   */

  insertChildrenAfter: function insertChildrenAfter(key, nodes) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);

    nodes = this.nodes.slice(0, index + 1).concat(nodes).concat(this.nodes.slice(index + 1));

    return this.merge({ nodes: nodes });
  },


  /**
   * Insert child `nodes` before child by `key`.
   *
   * @param {String or Node} key
   * @param {List} nodes
   * @return {Node} node
   */

  insertChildrenBefore: function insertChildrenBefore(key, nodes) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);

    nodes = this.nodes.slice(0, index).concat(nodes).concat(this.nodes.slice(index));

    return this.merge({ nodes: nodes });
  },


  /**
   * Check if the inline nodes are split at a `range`.
   *
   * @param {Selection} range
   * @return {Boolean} isSplit
   */

  isInlineSplitAtRange: function isInlineSplitAtRange(range) {
    range = range.normalize(this);
    if (range.isExpanded) throw new Error();

    var _range4 = range;
    var startKey = _range4.startKey;

    var start = this.getFurthestInline(startKey) || this.getDescendant(startKey);
    return range.isAtStartOf(start) || range.isAtEndOf(start);
  },


  /**
   * Map all child nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node} node
   */

  mapChildren: function mapChildren(iterator) {
    var _this5 = this;

    var nodes = this.nodes;

    nodes.forEach(function (node, i) {
      var ret = iterator(node, i, _this5.nodes);
      if (ret != node) nodes = nodes.set(ret.key, ret);
    });

    return this.merge({ nodes: nodes });
  },


  /**
   * Map all descendant nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node} node
   */

  mapDescendants: function mapDescendants(iterator) {
    var _this6 = this;

    var nodes = this.nodes;

    nodes.forEach(function (node, i) {
      var ret = node;
      if (ret.kind != 'text') ret = ret.mapDescendants(iterator);
      ret = iterator(ret, i, _this6.nodes);
      if (ret == node) return;

      var index = nodes.indexOf(node);
      nodes = nodes.set(index, ret);
    });

    return this.merge({ nodes: nodes });
  },


  /**
   * Normalize the node by joining any two adjacent text child nodes.
   *
   * @return {Node} node
   */

  normalize: function normalize() {
    var node = this;
    var keys = new _immutable.Set();
    var removals = new _immutable.Set();

    // Map this node's descendants, ensuring...
    node = node.mapDescendants(function (desc) {
      if (removals.has(desc.key)) return desc;

      // ...that there are no duplicate keys.
      if (keys.has(desc.key)) desc = desc.set('key', (0, _uid2.default)());
      keys = keys.add(desc.key);

      // ...that void nodes contain a single space of content.
      if (desc.isVoid && desc.text != ' ') {
        desc = desc.merge({
          nodes: _text3.default.createList([{
            characters: _character2.default.createList([{ text: ' ' }])
          }])
        });
      }

      // ...that no block or inline has no text node inside it.
      if (desc.kind != 'text' && desc.nodes.size == 0) {
        var text = _text3.default.create();
        var nodes = desc.nodes.push(text);
        desc = desc.merge({ nodes: nodes });
      }

      // ...that no inline node is empty.
      if (desc.kind == 'inline' && desc.text == '') {
        removals = removals.add(desc.key);
      }

      return desc;
    });

    // Remove any nodes marked for removal.
    removals.forEach(function (key) {
      node = node.removeDescendant(key);
    });

    removals = removals.clear();

    // And, ensuring...
    node = node.mapDescendants(function (desc) {
      if (desc.kind == 'text') {
        var next = node.getNextSibling(desc);

        // ...that there are no adjacent text nodes.
        if (next && next.kind == 'text') {
          while (next && next.kind == 'text') {
            var characters = desc.characters.concat(next.characters);
            desc = desc.merge({ characters: characters });
            removals = removals.add(next.key);
            next = node.getNextSibling(next);
          }
        }

        // ...that there are no extra empty text nodes.
        else if (desc.length == 0) {
            var parent = node.getParent(desc);
            if (!removals.has(parent.key) && parent.nodes.size > 1) {
              removals = removals.add(desc.key);
            }
          }
      }

      return desc;
    });

    // Remove any nodes marked for removal.
    removals.forEach(function (key) {
      node = node.removeDescendant(key);
    });

    return node;
  },


  /**
   * Remove children after a child by `key`.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  removeChildrenAfter: function removeChildrenAfter(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    var nodes = this.nodes.slice(0, index + 1);
    return this.merge({ nodes: nodes });
  },


  /**
   * Remove children after a child by `key`, including the child.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  removeChildrenAfterIncluding: function removeChildrenAfterIncluding(key) {
    var child = this.assertChild(key);
    var index = this.nodes.indexOf(child);
    var nodes = this.nodes.slice(0, index);
    return this.merge({ nodes: nodes });
  },


  /**
   * Remove a `node` from the children node map.
   *
   * @param {String or Node} key
   * @return {Node} node
   */

  removeDescendant: function removeDescendant(key) {
    var node = this;
    var desc = node.assertDescendant(key);
    var parent = node.getParent(desc);
    var index = parent.nodes.indexOf(desc);
    var isParent = node == parent;
    var nodes = parent.nodes.splice(index, 1);

    parent = parent.merge({ nodes: nodes });
    node = isParent ? parent : node.updateDescendant(parent);

    return node;
  },


  /**
   * Set a new value for a child node by `key`.
   *
   * @param {Node} node
   * @return {Node} node
   */

  updateDescendant: function updateDescendant(node) {
    this.assertDescendant(node);
    return this.mapDescendants(function (d) {
      return d.key == node.key ? node : d;
    });
  }
};

/**
 * Normalize a `key`, from a key string or a node.
 *
 * @param {String or Node} key
 * @return {String} key
 */

function normalizeKey(key) {
  if (typeof key == 'string') return key;
  return key.key;
}

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
 * Transforms.
 */

for (var key in _transforms2.default) {
  Node[key] = _transforms2.default[key];
}

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Node, ['assertChild', 'assertDescendant', 'findDescendant', 'filterDescendants', 'getBlocks', 'getBlocksAtRange', 'getCharactersAtRange', 'getChildrenAfter', 'getChildrenAfterIncluding', 'getChildrenBefore', 'getChildrenBeforeIncluding', 'getChildrenBetween', 'getChildrenBetweenIncluding', 'getClosest', 'getClosestBlock', 'getClosestInline', 'getChild', 'getDescendant', 'getDepth', 'getFragmentAtRange', 'getFurthest', 'getFurthestBlock', 'getFurthestInline', 'getHighestChild', 'getHighestOnlyChildParent', 'getInlinesAtRange', 'getMarksAtRange', 'getNextBlock', 'getNextSibling', 'getNextText', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPreviousSibling', 'getPreviousText', 'getPreviousBlock', 'getTextAtOffset', 'getTexts', 'getTextsAtRange', 'hasChild', 'hasDescendant', 'hasVoidParent', 'isInlineSplitAtRange']);

/**
 * Export.
 */

exports.default = Node;