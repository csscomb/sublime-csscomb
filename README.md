# CSScomb for Sublime Text

## About

CSScomb is a coding style formatter for CSS.    
You can easily write your own configuration to make your stylesheets beautiful
and consistent.

## The Requirements

You need Node.js to make this plugin work.

### Caveats

If node has been installed with NVM you need to make a symlink to node in `/usr/local/bin`. Using OS X, the binary path would typically be `/Users/[your name]/.nvm/[node version]/bin/node`.

## Plugin usage

Press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd> or open "Tools" menu and select "Run CSScomb".

## Custom configuration

Custom configuration is fun and simple: just put `.csscomb.json` file in the
project root or your `HOME` directory.

You can read more about available options
[in docs](https://github.com/csscomb/csscomb.js/blob/master/doc/options.md).

You can also store config right in ST's settings.  
Open `Preferences > Package Settings > CSScomb` and see `Settings - Default`
for an example.

## Issues & bugs

[Plugin tracker](https://github.com/csscomb/sublime-csscomb/issues)    
[CSScomb tracker](https://github.com/csscomb/csscomb.js/issues)

## Authors

[@tonyganch](https://github.com/tonyganch)

