'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
    This module contains the default schema to normalize documents
 */

function isInlineVoid(node) {
  return node.kind == 'inline' && node.isVoid;
}

/**
 * A default schema rule to only allow block nodes in documents.
 *
 * @type {Object}
 */

var DOCUMENT_CHILDREN_RULE = {
  match: function match(node) {
    return node.kind == 'document';
  },
  validate: function validate(document) {
    var nodes = document.nodes;

    var invalids = nodes.filter(function (n) {
      return n.kind != 'block';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, document, invalids) {
    return invalids.reduce(function (t, n) {
      return t.removeNodeByKey(n.key);
    }, transform);
  }
};

/**
 * A default schema rule to only allow block, inline and text nodes in blocks.
 *
 * @type {Object}
 */

var BLOCK_CHILDREN_RULE = {
  match: function match(node) {
    return node.kind == 'block';
  },
  validate: function validate(block) {
    var nodes = block.nodes;

    var invalids = nodes.filter(function (n) {
      return n.kind != 'block' && n.kind != 'inline' && n.kind != 'text';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    return invalids.reduce(function (t, n) {
      return t.removeNodeByKey(n.key);
    }, transform);
  }
};

/**
 * A default schema rule to have at least one text node in blocks/inlines
 *
 * @type {Object}
 */

var MIN_TEXT_RULE = {
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var nodes = node.nodes;

    return nodes.size === 0 ? true : null;
  },
  normalize: function normalize(transform, node) {
    return transform.insertNodeByKey(node.key, 0, _text2.default.create());
  }
};

/**
 * A default schema rule to only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

var INLINE_CHILDREN_RULE = {
  match: function match(object) {
    return object.kind == 'inline';
  },
  validate: function validate(inline) {
    var nodes = inline.nodes;

    var invalids = nodes.filter(function (n) {
      return n.kind != 'inline' && n.kind != 'text';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, inline, invalids) {
    return invalids.reduce(function (t, n) {
      return t.removeNodeByKey(n.key);
    }, transform);
  }
};

/**
 * A default schema rule to ensure that inline nodes are not empty
 *
 * @type {Object}
 */

var INLINE_NO_EMPTY = {
  match: function match(object) {
    return object.kind == 'inline';
  },
  validate: function validate(inline) {
    return inline.text == '';
  },
  normalize: function normalize(transform, node) {
    return transform.removeNodeByKey(node.key);
  }
};

/**
 * A default schema rule to ensure that void nodes contain a single space of content.
 *
 * @type {Object}
 */

var INLINE_VOID_TEXT_RULE = {
  match: function match(object) {
    return (object.kind == 'inline' || object.kind == 'block') && object.isVoid;
  },
  validate: function validate(node) {
    return node.text !== ' ' || node.nodes.size !== 1;
  },
  normalize: function normalize(transform, node) {
    transform = node.nodes.reduce(function (t, child) {
      return t.removeNodeByKey(child.key);
    }, transform);

    return transform.insertNodeByKey(node.key, 0, _text2.default.createFromString(' '));
  }
};

/**
 * A default schema rule to ensure that inline void nodes are surrounded with text nodes
 *
 * @type {Object}
 */

var INLINE_VOID_TEXTS_AROUND_RULE = {
  match: function match(object) {
    return object.kind == 'block';
  },
  validate: function validate(block) {
    var invalids = block.nodes.reduce(function (accu, child, index) {
      if (child.kind === 'block' || !child.isVoid) {
        return accu;
      }

      var prevNode = index > 0 ? block.nodes.get(index - 1) : null;
      var nextNode = block.nodes.get(index + 1);

      var prev = !prevNode || isInlineVoid(prevNode);
      var next = !nextNode || isInlineVoid(nextNode.kind);

      if (next || prev) {
        accu.push({ next: next, prev: prev, index: index });
      }

      return accu;
    }, []);

    return invalids.length ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    return invalids.reduce(function (t, _ref) {
      var index = _ref.index;
      var next = _ref.next;
      var prev = _ref.prev;

      if (prev) t = transform.insertNodeByKey(block.key, index, _text2.default.create());
      if (next) t = transform.insertNodeByKey(block.key, index + 1, _text2.default.create());
      return t;
    }, transform);
  }
};

/**
 * Join adjacent text nodes.
 *
 * @type {Object}
 */

var NO_ADJACENT_TEXT_RULE = {
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var nodes = node.nodes;

    var invalids = nodes.map(function (n, i) {
      var next = nodes.get(i + 1);
      if (n.kind !== 'text' || !next || next.kind !== 'text') {
        return;
      }

      return [n, next];
    }).filter(Boolean);

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, pairs) {
    return pairs
    // We reverse the list since we want to handle 3 consecutive text nodes
    .reverse().reduce(function (t, pair) {
      var _pair = _slicedToArray(pair, 2);

      var first = _pair[0];
      var second = _pair[1];

      return t.joinNodeByKey(second.key, first.key);
    }, transform);
  }
};

/**
 * Prevent extra empty text nodes.
 *
 * @type {Object}
 */

var NO_EMPTY_TEXT_RULE = {
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var nodes = node.nodes;


    if (nodes.size <= 1) {
      return;
    }

    var invalids = nodes.filter(function (desc, i) {
      if (desc.kind != 'text' || desc.length > 0) {
        return;
      }

      // Empty text nodes are only allowed near inline void node
      var next = nodes.get(i + 1);
      var prev = i > 0 ? nodes.get(i - 1) : null;

      // If last one and previous is an inline void, we need to preserve it
      if (!next && isInlineVoid(prev)) {
        return;
      }

      // If first one and next one is an inline, we preserve it
      if (!prev && isInlineVoid(next)) {
        return;
      }

      // If surrounded by inline void, we preserve it
      if (next && prev && isInlineVoid(next) && isInlineVoid(prev)) {
        return;
      }

      // Otherwise we remove it
      return true;
    });

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, invalids) {
    return invalids.reduce(function (t, text) {
      return t.removeNodeByKey(text.key);
    }, transform);
  }
};

/**
 * The default schema.
 *
 * @type {Object}
 */

var schema = _schema2.default.create({
  rules: [DOCUMENT_CHILDREN_RULE, BLOCK_CHILDREN_RULE, INLINE_CHILDREN_RULE, INLINE_VOID_TEXT_RULE, MIN_TEXT_RULE, INLINE_NO_EMPTY, INLINE_VOID_TEXTS_AROUND_RULE, NO_ADJACENT_TEXT_RULE, NO_EMPTY_TEXT_RULE]
});

exports.default = schema;