'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Get leaf text for a node
 *
 * @param {Node} node
 * @return {Text} text
 */

function getLeafText(node) {
  if (node.kind == 'text') {
    return node;
  }

  var texts = node.getTexts();
  return texts.first();
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getLeafText;