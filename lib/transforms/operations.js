'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMarkOperation = addMarkOperation;
exports.insertNodeOperation = insertNodeOperation;
exports.insertTextOperation = insertTextOperation;
exports.joinNodeOperation = joinNodeOperation;
exports.moveNodeOperation = moveNodeOperation;
exports.removeMarkOperation = removeMarkOperation;
exports.removeNodeOperation = removeNodeOperation;
exports.removeTextOperation = removeTextOperation;
exports.setMarkOperation = setMarkOperation;
exports.setNodeOperation = setNodeOperation;
exports.setSelectionOperation = setSelectionOperation;
exports.splitNodeOperation = splitNodeOperation;

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add mark to text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @return {Transform}
 */

function addMarkOperation(transform, path, offset, length, mark) {
  var inverse = [{
    type: 'remove_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark
  }];

  var operation = {
    type: 'add_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Insert a `node` at `index` in a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} index
 * @param {Node} node
 * @return {Transform}
 */

function insertNodeOperation(transform, path, index, node) {
  var inversePath = path.slice().concat([index]);
  var inverse = [{
    type: 'remove_node',
    path: inversePath
  }];

  var operation = {
    type: 'insert_node',
    path: path,
    index: index,
    node: node,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Insert `text` at `offset` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {String} text
 * @param {Set} marks (optional)
 * @return {Transform}
 */

function insertTextOperation(transform, path, offset, text, marks) {
  var inverseLength = text.length;
  var inverse = [{
    type: 'remove_text',
    path: path,
    offset: offset,
    length: inverseLength
  }];

  var operation = {
    type: 'insert_text',
    path: path,
    offset: offset,
    text: text,
    marks: marks,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Join a node by `path` with a node `withPath`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Array} withPath
 * @return {Transform}
 */

function joinNodeOperation(transform, path, withPath) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var offset = node.length;

  var inverse = [{
    type: 'split_node',
    path: withPath,
    offset: offset
  }];

  var operation = {
    type: 'join_node',
    path: path,
    withPath: withPath,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Move a node by `path` to a `newPath` and `newIndex`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Array} newPath
 * @param {Number} newIndex
 * @return {Transform}
 */

function moveNodeOperation(transform, path, newPath, newIndex) {
  var state = transform.state;
  var document = state.document;

  var parentPath = path.slice(0, -1);
  var parentIndex = path[path.length - 1];
  var inversePath = newPath.slice().concat([newIndex]);

  var inverse = [{
    type: 'move_node',
    path: inversePath,
    newPath: parentPath,
    newIndex: parentIndex
  }];

  var operation = {
    type: 'move_node',
    path: path,
    newPath: newPath,
    newIndex: newIndex,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Remove mark from text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

function removeMarkOperation(transform, path, offset, length, mark) {
  var inverse = [{
    type: 'add_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark
  }];

  var operation = {
    type: 'remove_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Remove a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @return {Transform}
 */

function removeNodeOperation(transform, path) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var inversePath = path.slice(0, -1);
  var inverseIndex = path.slice(-1);

  var inverse = [{
    type: 'insert_node',
    path: inversePath,
    index: inverseIndex,
    node: node
  }];

  var operation = {
    type: 'remove_node',
    path: path,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Remove text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @return {Transform}
 */

function removeTextOperation(transform, path, offset, length) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var ranges = node.getRanges();
  var inverse = [];

  ranges.reduce(function (start, range) {
    var text = range.text,
        marks = range.marks;

    var end = start + text.length;
    if (start > offset + length) return;
    if (end <= offset) return;

    var endOffset = Math.min(end, offset + length);
    var string = text.slice(offset, endOffset);

    inverse.push({
      type: 'insert_text',
      path: path,
      offset: offset,
      text: string,
      marks: marks
    });

    return end;
  }, 0);

  var operation = {
    type: 'remove_text',
    path: path,
    offset: offset,
    length: length,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

function setMarkOperation(transform, path, offset, length, mark, properties) {
  var inverseProps = {};

  for (var k in properties) {
    inverseProps[k] = mark[k];
  }

  var inverse = [{
    type: 'set_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    properties: inverseProps
  }];

  var operation = {
    type: 'set_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    properties: properties,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Set `properties` on a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Object || String} properties
 * @return {Transform}
 */

function setNodeOperation(transform, path, properties) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var inverseProps = {};

  for (var k in properties) {
    inverseProps[k] = node[k];
  }

  var inverse = [{
    type: 'set_node',
    path: path,
    properties: inverseProps
  }];

  var operation = {
    type: 'set_node',
    path: path,
    properties: properties,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}

/**
 * Set the selection to a new `selection`.
 *
 * @param {Transform} transform
 * @param {Mixed} selection
 * @return {Transform}
 */

function setSelectionOperation(transform, properties) {
  properties = _normalize2.default.selectionProperties(properties);

  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var prevProps = {};
  var props = {};

  // Remove any properties that are already equal to the current selection. And
  // create a dictionary of the previous values for all of the properties that
  // are being changed, for the inverse operation.
  for (var k in properties) {
    if (properties[k] == selection[k]) continue;
    props[k] = properties[k];
    prevProps[k] = selection[k];
  }

  // If the selection moves, clear any marks, unless the new selection
  // does change the marks in some way
  var moved = ['anchorKey', 'anchorOffset', 'focusKey', 'focusOffset'].some(function (p) {
    return props.hasOwnProperty(p);
  });

  if (selection.marks && properties.marks == selection.marks && moved) {
    props.marks = null;
  }

  // Resolve the selection keys into paths.
  /* if (props.anchorKey) {
    props.anchorPath = document.getPath(props.anchorKey)
    delete props.anchorKey
  }
   if (prevProps.anchorKey) {
    prevProps.anchorPath = document.getPath(prevProps.anchorKey)
    delete prevProps.anchorKey
  }
   if (props.focusKey) {
    props.focusPath = document.getPath(props.focusKey)
    delete props.focusKey
  }
   if (prevProps.focusKey) {
    prevProps.focusPath = document.getPath(prevProps.focusKey)
    delete prevProps.focusKey
  } */

  // Define an inverse of the operation for undoing.
  var inverse = [{
    type: 'set_selection',
    properties: prevProps
  }];

  // Define the operation.
  var operation = {
    type: 'set_selection',
    properties: props,
    inverse: inverse
  };

  // Apply the operation.
  return transform.applyOperation(operation);
}

/**
 * Split a node by `path` at `offset`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @return {Transform}
 */

function splitNodeOperation(transform, path, offset) {
  var inverseIndex = path[path.length - 1] + 1;
  var inversePath = path.slice(0, -1).concat([inverseIndex]);
  var inverse = [{
    type: 'join_node',
    path: inversePath,
    withPath: path
  }];

  var operation = {
    type: 'split_node',
    path: path,
    offset: offset,
    inverse: inverse
  };

  return transform.applyOperation(operation);
}