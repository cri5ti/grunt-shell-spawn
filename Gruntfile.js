'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        shell: {
            defaultAsync: {
                command: 'sleep 3 & echo EXEC DONE.',
                options: {
                    async: true
                }
            },

            defaultSync: {
                command: 'sleep 3 & echo EXEC DONE.',
                options: {
                    async: false
                }
            },

            asyncWithCallbacks: {
                command: 'sleep 3 & echo HELLO & sleep 1 & echo WORLD & sleep 2',
                options: {
                    async: true,
                    stdout: function(msg) {
                        console.log('MSG > ', msg);
                    },
                    callback: function(code, out, err, cb) {
                        console.log('FINISHED with code:', code);
                        console.log('OUT:', out);
                        console.log('ERR:', err);

                        console.log('Completing task in 5 secs');
                        setTimeout(function() { cb(); }, 5000);
                    }
                }
            },

            syncWithCallbacks: {
                command: 'sleep 3 & echo HELLO & sleep 1 & echo WORLD & sleep 2',
                options: {
                    async: false,
                    stdout: function(msg) {
                        console.log('MSG > ', msg);
                    },
                    callback: function(code, out, err, cb) {
                        console.log('FINISHED with code:', code);
                        console.log('OUT:', out);
                        console.log('ERR:', err);

                        console.log('Completing task in 5 secs');
                        setTimeout(function() { cb(); }, 5000);
                    }
                }
            },

            testProcessSync: {
                command: 'node tests/process/process.js',
                options: {
                    async: false,
                    callback: function (code, out, err, cb) {
                        validateTestProcessOutput(code, out, err);
                        cb();
                    }
                }
            },

            testProcessAsync: {
                command: 'node tests/process/process.js',
                options: {
                    async: true,
                    callback: function (code, out, err, cb) {
                        validateTestProcessOutput(code, out, err);
                        cb();
                    }
                }
            },

            neverEndingTask: {
                command: 'node tests/server/server.js',
                options: {
                    async: true
                }
            },

            restartableNeverEndingTask: {
                command: 'node tests/server/server.js',
                options: {
                    async: true,
                    stopIfStarted: true
                }
            },


            curl: {
                command: 'curl localhost:1337',
                options: {
                    async: false,
                    stdout: function(msg) {
                        if (msg !== 'success') {
                            console.error('Expected `msg` to equal `success`');
                            grunt.fatal('Expected `msg` to equal `success`');
                        }
                    }
                }
            },

            echo: {
                command: 'echo beep',
            },
        },

        nodeunit: {
            tests: ['tests/*_test.js']
        }

    });

    function validateTestProcessOutput(code, out, err) {
        // Validates expected stdout, stderr, and exit code of the test process at
        // tests/process/process.js. If any of them fail, print an error message in stderr (so that
        // the error can be seen when running tests - the grunt.fatal message does not get emitted),
        // and stop grunt.
        if (out !== 'This should appear in stdout\n') {
            console.error('stdout did not match. Got:"' + out + '"');
            grunt.fatal('stdout did not match');
        }
        if (err !== 'This should appear in stderr\n') {
            console.error('stderr did not match. Got:"' + err + '"');
            grunt.fatal('stderr did not match');
        }
        if (code !== 117) {
            console.error('Exit code did not match. Expected 117, got: ' + code + '.');
            grunt.fatal('exit code did not match');
        }
    }

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('wait', function() {
        var done = this.async();
        var seconds = parseInt(this.args[0], 10);
        if (isNaN(seconds)) { seconds = 1; }
        setTimeout(function () {
            done(true);
        }, 1000 * seconds);
    });

    // Test cases for the ':kill' task.
    // killTask: neverEndingTask launches a server on port 1337, and shell:curl tests that the
    //           server was launched successfully.
    // killTest: Simply runs killTask twice. If the process was not killed successfully, then the
    //           second time we attempt to launch the server, we would get an "address in use" error
    //           indicating that the previous server is still running.
    grunt.registerTask('killTask', ['shell:neverEndingTask', 'wait:2', 'shell:curl', 'shell:neverEndingTask:kill']);
    grunt.registerTask('killTest', ['killTask', 'wait:1', 'killTask']);

    grunt.registerTask('restartTask', ['shell:restartableNeverEndingTask', 'wait:2', 'shell:curl', 
                                       'shell:restartableNeverEndingTask', 'wait:2', 'shell:curl', 
                                       'shell:restartableNeverEndingTask:kill']);
    grunt.registerTask('restartTest', ['restartTask', 'wait:1', 'restartTask']);

    // Test case for allowing sequential runs of killable targets
    grunt.registerTask('repeat', ['shell:echo', 'shell:echo']);

    // Test case for capturing stdout, stderr, and exit code of an async process
    grunt.registerTask('testProcessAsync', ['shell:testProcessAsync', 'wait:2']);
};
