# grunt-shell-spawn

This is a fork on [sindresorhus][1]'s [grunt-shell][2] task to support asynchronous launching (in background).

E.g.: start a `compass watch` in the background.

[1]: https://github.com/sindresorhus
[2]: https://github.com/sindresorhus/grunt-shell

-----

### Example usage

Run `compass watch`

Simple task, no output, current directory:

```javascript
shell: {
    command: 'compass watch',
    options: {
        async: true
    }
}
```

Multitask, advanced:

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
    }
}
```

## License

MIT License
(c) [Sindre Sorhus](http://sindresorhus.com)

