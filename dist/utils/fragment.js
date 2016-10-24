'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _raw = require('../serializers/raw');

var _raw2 = _interopRequireDefault(_raw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Serialize a `string` as Base64.
 *
 * @param {Document} fragment
 * @return {String} encoded
 */

function serialize(fragment) {
  var raw = _raw2.default.serializeNode(fragment);
  var string = JSON.stringify(raw);
  var encoded = window.btoa(window.unescape(window.encodeURIComponent(string)));
  return encoded;
}

/**
 * Deserialize a `fragment` as Base64.
 *
 * @param {String} encoded
 * @return {Document} fragment
 */

function deserialize(encoded) {
  var string = window.decodeURIComponent(window.escape(window.atob(encoded)));
  var json = JSON.parse(string);
  var state = _raw2.default.deserialize(json);
  return state.document;
}

/**
 * Export.
 */

exports.default = {
  serialize: serialize,
  deserialize: deserialize
};