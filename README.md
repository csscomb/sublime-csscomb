# CSScomb for Sublime Text 2 & 3

## About

CSScomb is a coding style formatter for CSS.  
You can easily write your own configuration to make your stylesheets beautiful
and consistent.

## The Requirements

You need Node.js to make this plugin work.  
  
Make sure paths are set correctly in settings file:  
  
1.  Open default settings: `Preferences > Package Settings > CSScomb > Sort Order - Default`  
2.  Copy whole file content.  
3.  Open user-defined settings: `Preferences > Package Settings > CSScomb > Sort Order - User`  
4.  Paste in this file.  
5.  Follow instructions in file comments.  

## Plugin usage

Select code and press <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd>  
  
Tip: Combine expand selection by indentation <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>j</kbd> with <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>c</kbd> to quickly  
select all rules for current css selector and sort them with csscomb.

## Custom configuration

To use your own configuration file do one of the following:  

1.  Put `.csscomb.json` file in the project root or your HOME directory.
2.  Set path to config file in user settings:
    `{ "custom_config_path": "~/Sites/csscomb.json" }`
3.  Set path in Sublime project settings:
    `"CSScomb": { "custom_config_path": "~/Sites/.csscomb.json" },`

## Issues & bugs

[Plugin tracker](https://github.com/csscomb/csscomb-for-sublime)    
[CSScomb tracker](https://github.com/csscomb/csscomb.js/issues)

## Authors

Sublime plugin: [i-akhmadullin](https://github.com/i-akhmadullin)
