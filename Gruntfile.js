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

            neverEndingTask: {
                command: 'node tests/server/server.js',
                options: {
                    async: true,
                    kill: true
                }
            },

            curl: {
                command: 'curl http://localhost:1337',
                options: {
                    async: false,
                    stdout: function(msg) {
                        if (msg !== 'success') {
                            grunt.fatal('Expected `msg` to equal `success`');
                        }
                    }
                }
            }
        },

        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    grunt.loadTasks('tasks');

    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('wait', function() {
        this.async();
    });

    grunt.registerTask('killTask', ['shell:neverEndingTask', 'shell:curl', 'shell:neverEndingTask:kill']);
};
