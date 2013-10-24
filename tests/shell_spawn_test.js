'use strict';

var grunt = require('grunt');
var fs = require('fs');
var exec = require('child_process').exec;

exports.stylus = {
  defaultSync: function(test) {
    test.expect(2);

    exec('./node_modules/.bin/grunt shell:defaultSync', function(error, stdout, stderr) {
      test.equal(error, null, 'It should not error');
      test.equal(stderr, '', 'It should not error');
      test.done();
    });
  }
};
