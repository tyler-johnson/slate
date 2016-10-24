'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMarkByKey = addMarkByKey;
exports.insertNodeByKey = insertNodeByKey;
exports.insertTextByKey = insertTextByKey;
exports.joinNodeByKey = joinNodeByKey;
exports.moveNodeByKey = moveNodeByKey;
exports.removeMarkByKey = removeMarkByKey;
exports.removeNodeByKey = removeNodeByKey;
exports.removeTextByKey = removeTextByKey;
exports.setMarkByKey = setMarkByKey;
exports.setNodeByKey = setNodeByKey;
exports.splitNodeByKey = splitNodeByKey;

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _uid = require('../utils/uid');

var _uid2 = _interopRequireDefault(_uid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Add mark to text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @return {Transform}
 */

function addMarkByKey(transform, key, offset, length, mark) {
  mark = _normalize2.default.mark(mark);
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  return transform.addMarkOperation(path, offset, length, mark);
}

/**
 * Insert a `node` at `index` in a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} index
 * @param {Node} node
 * @return {Transform}
 */

function insertNodeByKey(transform, key, index, node) {
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  var newPath = path.slice().push(index);

  return transform.insertNodeOperation(path, index, node);
}

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {String} text
 * @param {Set} marks (optional)
 * @return {Transform}
 */

function insertTextByKey(transform, key, offset, text, marks) {
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  return transform.insertTextOperation(path, offset, text, marks);
}

/**
 * Join a node by `key` with a node `withKey`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {String} withKey
 * @return {Transform}
 */

function joinNodeByKey(transform, key, withKey) {
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  var withPath = document.getPath(withKey);
  return transform.joinNodeOperation(path, withPath);
}

/**
 * Move a node by `key` to a new parent by `key` and `index`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {String} newKey
 * @param {Number} index
 * @return {Transform}
 */

function moveNodeByKey(transform, key, newKey, newIndex) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(key);
  var prevParent = document.getParent(key);
  var path = document.getPath(key);
  var newPath = document.getPath(newKey);
  var parent = document.key == newKey ? document : document.assertDescendant(newKey);
  var previous = newIndex == 0 ? null : parent.nodes.get(newIndex - 1);
  var next = parent.nodes.get(newIndex);
  transform.moveNodeOperation(path, newPath, newIndex);

  return transform;
}

/**
 * Remove mark from text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

function removeMarkByKey(transform, key, offset, length, mark) {
  mark = _normalize2.default.mark(mark);
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  return transform.removeMarkOperation(path, offset, length, mark);
}

/**
 * Remove a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @return {Transform}
 */

function removeNodeByKey(transform, key) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(key);
  var path = document.getPath(key);
  var parent = document.getParent(key);
  var previous = document.getPreviousSibling(key);
  var next = document.getNextSibling(key);

  return transform.removeNodeOperation(path);
}

/**
 * Remove text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @return {Transform}
 */

function removeTextByKey(transform, key, offset, length) {
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  var parent = document.getParent(key);
  return transform.removeTextOperation(path, offset, length).normalizeNodeByKey(parent);
}

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @return {Transform}
 */

function setMarkByKey(transform, key, offset, length, mark, properties) {
  mark = _normalize2.default.mark(mark);
  properties = _normalize2.default.markProperties(properties);
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  return transform.setMarkOperation(path, offset, length, mark, properties);
}

/**
 * Set `properties` on a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object || String} properties
 * @return {Transform}
 */

function setNodeByKey(transform, key, properties) {
  properties = _normalize2.default.nodeProperties(properties);
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  transform.setNodeOperation(path, properties);

  return transform;
}

/**
 * Split a node by `key` at `offset`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @return {Transform}
 */

function splitNodeByKey(transform, key, offset) {
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  return transform.splitNodeOperation(path, offset);
}