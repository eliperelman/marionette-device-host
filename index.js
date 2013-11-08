var fsPath = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
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

  port: 2828,

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

    if(options.port == 0) {
      options.port = 2828;
    }

    this.port = options.port;
    var adb = spawn('adb', ['forward', 'tcp:' + this.port, 'tcp:' + this.port]);
    adb.on('close', function() {
      callback();
    });
    adb.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });
    adb.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  },

  /**
   * Stop the currently running host.
   *
   * @param {Function} callback [Error err].
   */
  stop: function(callback) {
    debug('stop');

    var adb = spawn('adb', ['forward', '--remove', 'tcp:' + this.port]);
    adb.on('close', function() {
      callback();
    });
    adb.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });
    adb.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }
};

module.exports = Host;
