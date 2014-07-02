var tcpPort = require('tcp-port-used');
var _ = require('lodash');
var child = require('child_process');
var debug = require('debug')('marionette-device-host');

const DEFAULT_PORT = 2828;

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
  this.setOptions(options);
}

/**
 * Immutable metadata describing this host.
 *
 * @type {Object}
 */
Host.metadata = Object.freeze({
  host: 'device'
});

Host.firstRun = true;

Host.prototype = {
  /**
   * Set the options on the Host object, using defaults for missing values
   *
   * @param {Object} [options] settings provided by caller.
   */
  setOptions: function(options) {
    this.options = _.merge({
      host: 'localhost',
      port: DEFAULT_PORT
    }, this.options, options);
  },

  /**
   * Restart the B2G process and trigger a callback once complete
   *
   * @param {Function} callback.
   */
  restartB2G: function(callback) {
    var command = 'adb shell stop b2g && adb shell start b2g && sleep 2';

    child.exec(command, function() {
      callback && callback();
    });
  },

  /**
   * Start ADB and trigger a callback once the port is ready
   *
   * @param {Function} callback.
   */
  setupAdb: function(callback) {
    var port = this.options.port;
    var host = this.options.host;
    var retryInterval = 100;
    var timeout = 10000;
    var adb = child.spawn('adb', [
      'forward',
        'tcp:' + port,
        'tcp:' + DEFAULT_PORT
    ]);

    adb.stdout.on('data', function(data) {
      console.error('(start) stdout: ' + data);
    });

    adb.stderr.on('data', function(data) {
      console.error('(start) stderr: ' + data);
    });

    tcpPort
      .waitUntilUsedOnHost(port, host, retryInterval, timeout)
      .then(function() {
        debug('Set adb forward to ' + port);
        callback && callback();
      });
  },

  /**
   * Start this series of tests once ADB is ready
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

    this.setOptions(options);
    debug('start');

    if (!Host.firstRun) {
      return this.setupAdb(callback);
    }

    Host.firstRun = false;

    this.restartB2G(function() {
      this.setupAdb(callback);
    }.bind(this));
  },

  /**
   * Stop the adb forward.
   *
   * @param {Function} callback [Error err].
   */
  stop: function(callback) {
    debug('stop');

    var port = this.options.port;
    var adb = child.spawn('adb', [
      'forward',
      '--remove',
      'tcp:' + port
    ]);

    adb.on('close', function() {
      debug('Removed the forward to port ' + port);
      callback();
    });

    adb.stdout.on('data', function(data) {
      console.error('(stop) stdout: ' + data);
    });

    adb.stderr.on('data', function(data) {
      console.error('(stop) stderr: ' + data);
    });
  }
};

module.exports = Host;
