'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _environment = require('./environment');

/**
 * Does an `e` have the alt modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isAlt(e) {
  return e.altKey;
}

/**
 * Does an `e` have the command modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isCommand(e) {
  return _environment.IS_MAC ? e.metaKey && !e.altKey : e.ctrlKey && !e.altKey;
}

/**
 * Does an `e` have the control modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isCtrl(e) {
  return e.ctrlKey && !e.altKey;
}

/**
 * Does an `e` have the line-level modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isLine(e) {
  return _environment.IS_MAC ? e.metaKey : false;
}

/**
 * Does an `e` have the Mac command modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isMacCommand(e) {
  return _environment.IS_MAC && isCommand(e);
}

/**
 * Does an `e` have the option modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isOption(e) {
  return _environment.IS_MAC && e.altKey;
}

/**
 * Does an `e` have the shift modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isShift(e) {
  return e.shiftKey;
}

/**
 * Does an `e` have the Windows command modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isWindowsCommand(e) {
  return _environment.IS_WINDOWS && isCommand(e);
}

/**
 * Does an `e` have the word-level modifier?
 *
 * @param {Event} e
 * @return {Boolean}
 */

function isWord(e) {
  return _environment.IS_MAC ? e.altKey : e.ctrlKey;
}

/**
 * Export.
 */

exports.default = {
  isAlt: isAlt,
  isCommand: isCommand,
  isCtrl: isCtrl,
  isLine: isLine,
  isMacCommand: isMacCommand,
  isOption: isOption,
  isShift: isShift,
  isWindowsCommand: isWindowsCommand,
  isWord: isWord
};