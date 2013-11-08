var fsPath = require('path'),
    fs = require('fs'),
    spawn = require('./index').spawn,
    debug = require('debug')('marionette-device-host');

/**
 * Host interface for marionette-js-runner.
 *
 * TODO: I think this API is much more sane then the original
 *       |spawn| interface but we also need to do some refactoring
 *       in the mozilla-profile-builder project to improve the apis.
 *
 * @param {Object} [options] for host see spawn for now.
 */
function Host(options) {
  this.options = options || {};
  if (!this.options.host)
    this.options.host = 'localhost';
  if (!this.options.port)
    this.options.post = 2828;
}

/**
 * Immutable metadata describing this host.
 *
 * @type {Object}
 */
Host.metadata = Object.freeze({
  host: 'device'
});

Host.prototype = {
  /**
   * Reference to b2g-desktop process.
   *
   * @type {ChildProcess}
   * @private
   */
  _process: null,

  /**
   * Starts the b2g-desktop process.
   *
   * @param {String} profile path.
   * @param {Object} [options] settings provided by caller.
   * @param {Function} callback [Error err].
   */
  start: function(profile, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = options || {};

    debug('start');

//    mozrunner.run('adb shell stop b2g');
//    mozrunner.run('adb shell start b2g');
  },

  /**
   * Stop the currently running host.
   *
   * @param {Function} callback [Error err].
   */
  stop: function(callback) {
    debug('stop');

  }
};

module.exports = Host;
