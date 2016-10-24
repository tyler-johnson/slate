'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeNodeWith = normalizeNodeWith;
exports.normalizeWith = normalizeWith;
exports.normalize = normalize;
exports.normalizeDocument = normalizeDocument;
exports.normalizeNodeByKey = normalizeNodeByKey;
exports.normalizeSelection = normalizeSelection;

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _raw = require('../serializers/raw');

var _raw2 = _interopRequireDefault(_raw);

var _warning = require('../utils/warning');

var _warning2 = _interopRequireDefault(_warning);

var _schema3 = require('../plugins/schema');

var _schema4 = _interopRequireDefault(_schema3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Refresh a reference to a node that have been modified in a transform.
 * @param  {Transform} transform
 * @param  {Node} node
 * @return {Node} newNode
 */

function _refreshNode(transform, node) {
  var state = transform.state;
  var document = state.document;


  if (node.kind == 'document') {
    return document;
  }

  return document.getDescendant(node.key);
}

/**
 * Normalize all children of a node
 * @param  {Transform} transform
 * @param  {Schema} schema
 * @param  {Node} node
 * @return {Transform} transform
 */

function _normalizeChildrenWith(transform, schema, node) {
  var state = transform.state;


  if (!node.nodes) {
    return transform;
  }

  return node.nodes.reduce(function (t, child) {
    return t.normalizeNodeWith(schema, child);
  }, transform);
}

/**
 * Normalize a node without its children
 * @param  {Transform} transform
 * @param  {Schema} schema
 * @param  {Node} node
 * @return {Transform} transform
 */

function _normalizeNodeWith(transform, schema, node) {
  var _transform = transform;
  var state = _transform.state;

  var failure = schema.__validate(node);

  // Node is valid?
  if (!failure) {
    return transform;
  }

  var value = failure.value;
  var rule = failure.rule;

  // Normalize and get the new state

  transform = rule.normalize(transform, node, value);

  // Search for the updated node in the new state
  var newNode = _refreshNode(transform, node);

  // Node no longer exist, go back to normalize parents
  if (!newNode) {
    return transform;
  }

  return _normalizeNodeWith(transform, schema, newNode);
}

/**
 * Normalize a node (itself and its children) using a schema.
 *
 * @param  {Transform} transform
 * @param  {Schema} schema
 * @param  {Node} node
 * @return {Transform}
 */

function normalizeNodeWith(transform, schema, node) {
  // Iterate over its children
  transform = _normalizeChildrenWith(transform, schema, node);

  // Refresh the node reference, and normalize it
  node = _refreshNode(transform, node);
  if (node) {
    transform = _normalizeNodeWith(transform, schema, node);
  }

  return transform;
}

/**
 * Normalize state using a schema.
 *
 * @param  {Transform} transform
 * @param  {Schema} schema
 * @return {Transform} transform
 */

function normalizeWith(transform, schema) {
  var state = transform.state;
  var document = state.document;


  return transform.normalizeNodeWith(schema, document);
}

/**
 * Normalize the state using the core schema.
 *
 * @param  {Transform} transform
 * @return {Transform} transform
 */

function normalize(transform) {
  return transform.normalizeDocument().normalizeSelection();
}

/**
 * Normalize only the document
 *
 * @param  {Transform} transform
 * @return {Transform} transform
 */

function normalizeDocument(transform) {
  return transform.normalizeWith(_schema4.default);
}

/**
 * Normalize a specific node using core schema
 *
 * @param  {Transform} transform
 * @param  {Node or String} key
 * @return {Transform} transform
 */

function normalizeNodeByKey(transform, key) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(key);

  return transform.normalizeNodeWith(_schema4.default, node);
}

/**
 * Normalize only the selection.
 *
 * @param  {Transform} transform
 * @return {Transform} transform
 */

function normalizeSelection(transform) {
  var state = transform.state;
  var _state = state;
  var document = _state.document;
  var selection = _state.selection;

  selection = selection.normalize(document);

  // If the selection is nulled (not normal)
  if (selection.isUnset || !document.hasDescendant(selection.anchorKey) || !document.hasDescendant(selection.focusKey)) {
    (0, _warning2.default)('Selection was invalid and reset to start of the document');
    var firstText = document.getTexts().first();
    selection = selection.merge({
      anchorKey: firstText.key,
      anchorOffset: 0,
      focusKey: firstText.key,
      focusOffset: 0,
      isBackward: false
    });
  }

  state = state.merge({ selection: selection });
  transform.state = state;
  return transform;
}