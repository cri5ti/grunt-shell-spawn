'use strict';

var grunt = require('grunt');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

// Path to the grunt executable that should work cross-platform.
var grunt = path.normalize('node_modules/.bin/grunt');

// Tests that there is no error reported in either the error object or in stderr.
function shouldNotError (test, error, stderr) {
  test.equal(error, null, 'Error: ' + error);
  test.equal(stderr, '', 'Error: ' + stderr);
}

/**
 * Generic function for running a test task defined in the Gruntfile and making sure that it did
 * not error out.
 * @param {String} task The name of the task to run. The task should be defined in Gruntfile.js.
 * @param {Object} test The nodeunit test object.
 */
function runTestTask (task, test) {
  test.expect(2);

  exec(grunt + ' ' + task, function(error, stdout, stderr) {
    shouldNotError(test, error, stderr);
    test.done();
  });
}


// Tests
// -----
//
// Please note that if you want to see the error message in the output when running tests, you have
// to print the error using console.error(). Whatever you pass to grunt.fatal() will not be visible
// in the test output. Therefore, when you're writing a task for testing, you should both print the
// error using console.error() so that the error is visible, and also call grunt.fatal() to stop the
// task.

exports['grunt-shell-spawn'] = {

  defaultSync: runTestTask.bind(null, 'shell:defaultSync'),

  'Running a synchronous target twice': runTestTask.bind(null, 'repeat'),

  'Captures stdout, stderr, and exit code of synchronous process': runTestTask.bind(null, 'shell:testProcessSync'),

  'Captures stdout, stderr, and exit code of async process': runTestTask.bind(null, 'testProcessAsync'),

  ':kill terminates the process': runTestTask.bind(null, 'killTest'),

  'stopIfStarted option allows restarting a started process': runTestTask.bind(null, 'restartTest')
};
