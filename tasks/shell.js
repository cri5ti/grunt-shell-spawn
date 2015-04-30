
/*
 * (c) Sindre Sorhus
 * sindresorhus.com
 * MIT License
 */
module.exports = function( grunt ) {
    'use strict';

    var _ = grunt.util._;
    var log = grunt.log;

    // Keep track of killable and killed processes.
    var killable = {};
    var killed = {};

    grunt.registerMultiTask( 'shell', 'Run shell commands', function() {

        var cp = require('child_process');
        var execSync = require('sync-exec');
        var proc;

        var options = this.options({stdout: true, stderr: true, failOnError: true, canKill: true, stopIfStarted: false});

        var data = this.data;
        var done = options.async ? function() {} : this.async();
        var target = this.target;
        var file, args, opts;

        grunt.verbose.writeflags(options, 'Options');

        // On Unix, set detached option to make it possible to kill the entire process group later
        opts = _.defaults({}, options.execOptions, { detached: (process.platform !== 'win32') });

        // Tests to see if user is trying to kill a running process
        var shouldKill = options.canKill && this.args.length === 1 && this.args[0] === 'kill';
        if (shouldKill) {

            proc = killable[target];
            if (!proc) {
                grunt.log.writeln('No running process for target:' + target);
                return;
            }
            grunt.verbose.writeln('Killing process for target: ' + target + ' (pid = ' + proc.pid + ')');

            // Mark that we're killing this process. This is required because a killed process will
            // have a null or a non-zero exit code, which would result in an error if the
            // failOnError option is set. It is assumed that if the user wants to kill a task, that
            // shouldn't cause an error (they meant to do it) and we should continue processing tasks.
            killed[target] = proc;

            // Kill the process group. Note that the proc.pid represents the PID of the parent shell
            // process (/bin/sh or cmd.exe). If we simply kill the parent process, the child
            // processes will remain running (they will become orphaned). Methods for killing the
            // entire process group vary by platform.
            if (process.platform === 'win32') {
                // On windows, we can run taskkill.exe with the /T parameter to do a tree kill. This
                // needs to be run synchronously in case the :kill task is the last task in the
                // list, as otherwise grunt will exit first and the process will keep running.
                execSync.run('taskkill /f /t /pid ' + proc.pid);
            } else {
                // On Unix, we can kill the entire process group by passing in a negative PID. Note
                // this requires passing in a signal, and it also required us to launch the process
                // with the option { detached: true }.
                process.kill(-proc.pid, 'SIGKILL');
            }

            delete killable[target];
            done();
            return;
        }

        if (process.platform === 'win32') {
            file = 'cmd.exe';
            args = ['/s', '/c', data.command ];
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

        proc = cp.spawn(file, args, opts );

        // Store proc to be killed!
        if (options.canKill) {
            if (killable[target]) {
                if (options.stopIfStarted) {
                    var oldProc = killable[target];
                    oldProc.removeAllListeners('close');
                    oldProc.on('close', function() {
                        log.ok('restarted :' + target);
                    });
                    //XXX: SIGTERM may not be enough, nor instantaneous,
                    //     but SIGKILL may have undesired effects.
                    oldProc.kill();
                } else {
                    grunt.fatal('Process :' + target + ' already started.');
                }
            }
            killable[target] = proc;
        }

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
            delete killable[target];
            if ( _.isFunction( options.callback ) ) {
                var stdOutString = stdOutBuf.toString('utf8', 0, stdOutPos),
                    stdErrString = stdErrBuf.toString('utf8', 0, stdErrPos);

                options.callback.call(this, code, stdOutString, stdErrString, done);
            } else if (code !== 0 && options.failOnError && !killed[target]){
                grunt.warn('Done, with errors: command "' + data.command + '" (target "' + target +
                    '") exited with code ' + code + '.');
                done();
            } else {
                done();
            }
        });

    });

    process.on('exit', function () {
        _.forEach(killable, function (proc, key, collection) {
            proc.kill();
            delete collection[key];
        });
    });

};
