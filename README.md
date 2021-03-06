# grunt-shell-spawn [![Build Status](https://travis-ci.org/jeking3/grunt-shell-spawn.svg?branch=master)](https://travis-ci.org/jeking3/grunt-shell-spawn) [![Build status](https://ci.appveyor.com/api/projects/status/vpf0vqtixd99suii/branch/master?svg=true)](https://ci.appveyor.com/project/jeking3/grunt-shell-spawn/branch/master)

> A fork of [sindresorhus][1]'s [grunt-shell][2] ***with support for background processes***.
> 
> *(e.g.: start a `compass watch` in the background)*

This plugin lets you:

- Run processes synchronously or asynchronously.
- Process stdout and stderr using functions.
- Run a function when an asynchronous process ends that gets the exit code.
- Kill an asynchronous process.
 
### Requirements

- node.js 4.x or later
- grunt 0.4 or later

### Install

    npm install grunt-shell-spawn --save-dev

Once the plugin has been installed, it may be enabled inside your Gruntfile with:

    grunt.loadNpmTasks('grunt-shell-spawn');

### Examples

#### Simple task:

Let's take for example launching a `compass watch` in background:

```javascript
shell: {
    command: 'compass watch',
    options: {
        async: true
    }
}
```

#### Multitask:

```javascript
shell: {
    compassWatch: {
        command: 'compass watch',
        options: {
            async: true,
            execOptions: {
                cwd: './src/www/'
           }
       }
    },
    coffeeCompile: {
        command: 'coffee -b -c -o /out /src',
        options: {
            async: false,
            execOptions: {
                cwd: './src/www/'
            }
        }
    },
    options: {
        stdout: true,
        stderr: true,
        failOnError: true
    }
}
```

#### Custom callbacks:

Works in synchronous or asynchronous mode.

```
    asyncWithCallbacks: {
        command: 'sleep 3 & echo HELLO & sleep 1 & echo WORLD & sleep 2',
        options: {
            async: true,
            stdout: function(data) { /* ... */ },
            stderr: function(data) { /* ... */ },
            callback: function(exitCode, stdOutStr, stdErrStr, done) { 
                done();
            }
        }
    }, 
```

#### Killing an async process

Stop a running async task with the `:kill` task argument. 

```
    server: {
        command: 'redis-server',
        options: {
            async: true,
        }
    },
```

> `grunt shell:server shell:somethingElse shell:server:kill`

The process will be killed with a SIGKILL.

Please note that processes that are not killed will continue running even after grunt finishes, unless explicitly terminated using `:kill`. This means it is required to use `:kill` to clean up any processes you started, unless you want them to continue running in the background.

## Release History

 * 2019-05-26   v0.4.1   Updated dependencies
 * 2019-01-29   v0.4.0   Added CI on Travis, AppVeyor; updated node.js engine dependency to >=4
 * 2019-01-26   v0.3.12   Removed dependency on exec-sync to resolve security advisory
 * 2015-01-07   v0.3.1   Fix the :kill task on UNIX and Windows
 * 2013-04-06   v0.1.3   Last version with support for grunt 0.3.x

## License

MIT License
(c) [Sindre Sorhus](http://sindresorhus.com)


[1]: https://github.com/sindresorhus
[2]: https://github.com/sindresorhus/grunt-shell

[cp_spawn]: http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
