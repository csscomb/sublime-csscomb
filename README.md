# CSScomb for Sublime Text

## About

CSScomb is a coding style formatter for CSS.    
You can easily write your own configuration to make your stylesheets beautiful
and consistent.

## The Requirements

You need Node.js to make this plugin work.

## Plugin usage

Select code and press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd>    
Or open "Tools" menu and select "Run CSScomb JS".

Tip: Combine expand selection by indentation <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>j</kbd> with <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd> to quickly select all rules for current css selector and sort them with csscomb.

## Custom configuration

Custom configuration is fun and simple: just put `.csscomb.json` file in the
project root or your `HOME` directory.

You can read more about available options
[in docs](https://github.com/csscomb/csscomb.js/blob/master/doc/options.md).

If for some reason you would like to set custom path to configuration file,
set it in plugin config:

```
{
    "custom_config_path": "Users/csscomb/project/config/csscomb.json"
}
```

## Caveats

If node has been installed with NVM you need to make a symlink to node in `/usr/local/bin`.  Using OS X, the binary path would typically be `/Users/[your name]/.nvm/[node version]/bin/node`.

## Issues & bugs

[Plugin tracker](https://github.com/csscomb/sublime-csscomb/issues)    
[CSScomb tracker](https://github.com/csscomb/csscomb.js/issues)

## Authors

[@tonyganch](https://github.com/tonyganch)

