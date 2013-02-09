module.exports = function( grunt ) {
	'use strict';

	function log( stdout ) {
		console.log( 'Directory listing:\n' + stdout );
	}

	grunt.initConfig({
		shell: {
			subfolder_ls: {
  		  command: 'ls',
        options: {
				  stderr: false,
				  failOnError: false,
				  execOptions: {
					  cwd: './tasks'
				  }
        }
			},
			options: {
				stdout: log,
        stderr: log
			}
		},
		jshint: {
			files: [
				'grunt.js',
				'tasks/**/*.js'
			],
			options: {
				es5: true,
				esnext: true,
				bitwise: true,
				curly: true,
				eqeqeq: true,
				latedef: true,
				newcap: true,
				noarg: true,
				noempty: true,
				regexp: true,
				undef: true,
				strict: true,
				trailing: true,
				smarttabs: true,
				node: true
			}
		},
		watch: {
			files: '<%= jshint.hint.files.src %>'
    }
	});

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadTasks('tasks');

	grunt.registerTask('default', ['jshint', 'shell']);

};