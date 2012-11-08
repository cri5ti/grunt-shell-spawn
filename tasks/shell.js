/*
 * grunt-shell
 * 0.1.2 - 2012-06-28
 * github.com/sindresorhus/grunt-shell
 *
 * (c) Sindre Sorhus
 * sindresorhus.com
 * MIT License
 */
module.exports = function( grunt ) {
    'use strict';

    var _ = grunt.utils._;
    var log = grunt.log;

    grunt.registerMultiTask( 'shell', 'Run shell commands', function() {

        var cp = require('child_process');

        var data = _.extend( [], grunt.config.get('shell')._options, this.data );
        var dataOut = data.stdout;
        var dataErr = data.stderr;
        var done = data.async ? function() {} : this.async();
        var file, args, opts;

        if (process.platform === 'win32') {
            file = 'cmd.exe';
            args = ['/s', '/c', '"' + data.command + '"'];
            // Make a shallow copy before patching so we don't clobber the user's
            // options object.
            opts = util._extend({}, data.execOptions);
            opts.windowsVerbatimArguments = true;
        } else {
            file = '/bin/sh';
            args = ['-c', data.command];
            opts = data.execOptions
        }

        var proc = cp.spawn( file, args, opts);

        proc.stdout.on('data', function (data) {
            if ( _.isFunction( dataOut ) ) {
                dataOut( data );
            } else if ( dataOut === true ) {
                log.write( data.toString() );
            }
        });

        proc.stderr.on('data', function (data) {
            if ( _.isFunction( dataErr ) ) {
                dataErr( data );
            } else if ( data.failOnError === true ) {
                grunt.fatal( data );
            } else if ( dataErr === true ) {
                log.error( data.toString() );
            }
        });


        proc.on('exit', function (code) {
            if ( _.isFunction( data.callback ) ) {
                data.callback.call(this);
            } else if ( 0 !== code ){
                grunt.warn("Done, with errors.", 3);
            }
            done();
        });

    });

};
