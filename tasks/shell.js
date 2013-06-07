
/*
 * (c) Sindre Sorhus
 * sindresorhus.com
 * MIT License
 */
module.exports = function( grunt ) {
    'use strict';

    var _ = grunt.util._;
    var log = grunt.log;

    grunt.registerMultiTask( 'shell', 'Run shell commands', function() {

        var cp = require('child_process');

        var options = this.options({stdout: true, stderr: true, failOnError: true});

        var data = this.data;
        var done = options.async ? function() {} : this.async();
        var file, args, opts;

        grunt.verbose.writeflags(options, 'Options');

        opts = _.defaults({}, options.execOptions);

        if (process.platform === 'win32') {
            file = 'cmd.exe';
            args = ['/s', '/c', data.command.replace(/\//g, '\\') ];
            opts.windowsVerbatimArguments = true;
        } else {
            file = '/bin/sh';
            args = ['-c', data.command];
        }

        grunt.verbose.writeln('Command: ' + file);
        grunt.verbose.writeflags(args, 'Args');

        var BUFF_LENGTH = 200*1024,
            stdOutPos = 0, 
            stdErrPos = 0,
            stdOutBuf, stdErrBuf;

        var stdBuffering = _.isFunction( options.callback );

        if (stdBuffering) {
            stdOutBuf = new Buffer(BUFF_LENGTH);
            stdErrBuf = new Buffer(BUFF_LENGTH);
        }
         
        var proc = cp.spawn(file, args, opts );

        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');

        proc.stdout.on('data', function(data) {
            if (stdBuffering) {
                stdOutPos += stdOutBuf.write(data, stdOutPos);
            }

            if( _.isFunction( options.stdout ) ) {
                options.stdout(data);
            } else if(options.stdout === true || grunt.option('verbose')) {
                log.write(data);
            }
        });

        proc.stderr.on('data', function(data) {
            if (stdBuffering) {
                stdErrPos += stdErrBuf.write(data, stdErrPos);
            }

            if( _.isFunction( options.stderr ) ) {
                options.stderr(data);
            } else if(options.stderr === true || grunt.option('verbose')) {
                log.error(data);
            }
        });


        proc.on('close', function (code) {
            if ( _.isFunction( options.callback ) ) {
                var stdOutString = stdOutBuf.toString('utf8', 0, stdOutPos),
                    stdErrString = stdOutBuf.toString('utf8', 0, stdErrPos);

                options.callback.call(this, code, stdOutString, stdErrString, done);
            } else if ( 0 !== code && options.failOnError ){
                grunt.warn("Done, with errors.");
                done();
            } else {
                done();
            }
        });

    });

};
