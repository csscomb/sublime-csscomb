var gonzales = require('gonzales-pe');
var minimatch = require('minimatch');
var vow = require('vow');
var vfs = require('vow-fs');

/**
 * @param {Array} predefinedOptions
 * @constructor
 * @name Comb
 */
var Comb = function(predefinedOptions) {
    // For unambiguity, use `that` to access public methods
    // and `_this` to access private ones.
    var that = this;

    /**
     * PRIVATE AREA
     * Those properties and methods are made available for easy testing.
     */
    Object.defineProperty(that, '_', {
        enumerable: false,
        writable: true,
        configurable: true
    });
    var _this = that._ = {};

    /**
     * PRIVATE PROPERTIES
     */

    // List of handlers:
    _this.handlers = null;
    // List of supported syntaxes:
    _this.supportedSyntaxes = Array.prototype.slice.call(arguments, 1);
    // List of file paths that should be excluded from processing:
    _this.exclude = null;
    // List of configured options with values:
    _this.configuredOptions = null;
    // Whether lint mode is on:
    _this.lint = null;
    // Whether verbose mode is on:
    _this.verbose = null;
    // Map of used options:
    _this.options = {};
    // List of option names in exact order they should be processed:
    _this.optionsOrder = [];
    _this.unmetOptions = {};

    /**
     * PRIVATE METHODS
     *   - addHandler;
     *   - lintTree;
     *   - processTree;
     *   - setValue;
     *   - shouldProcess;
     *   - shouldProcessFile;
     *   - updateOptionOrder;
     *   - usePredefinedOptions;
     */

    /**
     * Adds an option to list of configured options.
     *
     * @param {Object} option Option's object
     * @param {Object} value Value that should be set for the option
     * @returns {Object} Object with option's name, value and link to
     * `process()` method
     */
    _this.addHandler = function addHandler(option, value) {
        value = option.setValue ?
            option.setValue(value) :
            _this.setValue(option.accepts, value);
        _this.handlers.push(option);
        _this.configuredOptions[option.name] = value;
    };

    /**
     * Processes stylesheet tree node.
     *
     * @param {Object} tree Parsed tree
     * @returns {Array} List of found errors
     */
    _this.lintTree = function lintTree(tree, filename) {
        var _handlers;

        _handlers = _this.handlers.filter(function(handler) {
            var syntax = that.getSyntax();
            return handler.syntax.indexOf(syntax) > -1 &&
                   typeof handler.lint === 'function';
        }).map(function(handler) {
            return handler.lint.bind(that);
        });

        // We walk across complete tree for each handler,
        // because we need strictly maintain order in which handlers work,
        // despite fact that handlers work on different level of the tree.
        var errors = [];
        _handlers.forEach(function(handler) {
            tree.map(function(node) {
                var error = handler(node);
                if (!error) return;
                if (Array.isArray(error)) {
                    errors = errors.concat(error);
                } else {
                    errors.push(error);
                }
            });
        });

        if (filename) {
            errors.map(function(error) {
                return error.filename = filename;
            })
        }

        return errors;
    };

    /**
     * Processes stylesheet tree node.
     *
     * @param {Object} tree Parsed tree
     * @returns {Object} Modified tree (for chaining)
     */
    _this.processTree = function processTree(tree) {
        var _handlers;

        _handlers = _this.handlers.filter(function(handler) {
            var syntax = that.getSyntax();
            return handler.syntax.indexOf(syntax) > -1;
        }).map(function(handler) {
            return handler.process.bind(that);
        });

        // We walk across complete tree for each handler,
        // because we need strictly maintain order in which handlers work,
        // despite fact that handlers work on different level of the tree.
        _handlers.forEach(function(handler) {
            tree.map(handler);
        });
        return tree;
    };

    /**
     * Processes value and checks if it is acceptable by the option.
     *
     * @param {Object} acceptableValues Map of value types that are acceptable
     * by option. If `string` property is present, its value is a regular
     * expression that is used to validate value passed to the function.
     * @param {Object|undefined} value
     * @returns {Boolean|String} Valid option's value
     */
    _this.setValue = function setValue(acceptableValues, value) {
        if (!acceptableValues) throw new Error('Option\'s module must either' +
            ' implement `setValue()` method or provide `accepts` object' +
            ' with acceptable values.');

        var valueType = typeof value;
        var pattern = acceptableValues[valueType];

        if (!pattern) throw new Error('The option does not accept values of type "' +
            valueType + '".\nValue\'s type must be one the following: ' +
            Object.keys(acceptableValues).join(', ') + '.');

        switch (valueType) {
            case 'boolean':
                if (pattern.indexOf(value) < 0) throw new Error(' Value must be ' +
                    'one of the following: ' + pattern.join(', ') + '.');
                return value;
            case 'number':
                if (value !== parseInt(value)) throw new Error('Value must be an integer.');
                return new Array(value + 1).join(' ');
            case 'string':
                if (!value.match(pattern)) throw new Error('Value must match pattern ' +
                    pattern + '.');
                return value;
            default:
                throw new Error('If you see this message and you are not' +
                    ' a developer adding a new option, please open an issue here:' +
                    ' https://github.com/csscomb/csscomb.js/issues/new' +
                    '\nFor option to accept values of type "' + valueType +
                    '" you need to implement custom `setValue()` method. See' +
                    ' `lib/options/sort-order.js` for example.');
        }
    };

    /**
     * Checks if path is present in `exclude` list.
     *
     * @param {String} path
     * @returns {Boolean} False if specified path is present in `exclude` list.
     * Otherwise returns true.
     */
    _this.shouldProcess = function shouldProcess(path) {
        path = path.replace(/^\.\//, '');
        for (var i = _this.exclude.length; i--;) {
            if (_this.exclude[i].match(path)) return false;
        }
        return true;
    };

    /**
     * Checks if specified path is not present in `exclude` list and it has one of
     * acceptable extensions.
     *
     * @param {String} path
     * @returns {Boolean} False if the path either has unacceptable extension or
     * is present in `exclude` list. True if everything is ok.
     */
    _this.shouldProcessFile = function shouldProcessFile(path) {
        // Get file's extension:
        var syntax = path.split('.').pop();

        // Check if syntax is supported. If not, ignore the file:
        if (_this.supportedSyntaxes.indexOf(syntax) < 0) {
            return false;
        }
        return _this.shouldProcess(path);
    };

    /**
     * @param {Object} option
     */
    _this.updateOptionOrder = function updateOptionOrder(option) {
        var name = option.name;
        var runBefore = option.runBefore;
        var runBeforeIndex;

        _this.options[name] = option;

        if (runBefore) {
            runBeforeIndex = _this.optionsOrder.indexOf(runBefore);
            if (runBeforeIndex > -1) {
                _this.optionsOrder.splice(runBeforeIndex, 0, name);
            } else {
                _this.optionsOrder.push(name);
                if (!_this.unmetOptions[runBefore]) _this.unmetOptions[runBefore] = [];
                _this.unmetOptions[runBefore].push(name);
            }
        } else {
            _this.optionsOrder.push(name);
        }

        var unmet = _this.unmetOptions[name];
        if (unmet) {
            unmet.forEach(function(name) {
                var i = _this.optionsOrder.indexOf(name);
                _this.optionsOrder.splice(i, 1);
                _this.optionsOrder.splice( -1, 0, name);
            });
        }
    };

    _this.usePredefinedOptions = function usePredefinedOptions() {
        if (!predefinedOptions) return;

        predefinedOptions.forEach(function(option) {
            that.use(option);
        });
    };


    /**
     * PUBLIC INSTANCE METHODS
     * Methods that depend on certain instance variables, e.g. configuration:
     *   - configure;
     *   - getOptionsOrder;
     *   - getSyntax;
     *   - getValue;
     *   - lintFile;
     *   - lintDirectory;
     *   - lintPath;
     *   - lintString;
     *   - processFile;
     *   - processDirectory;
     *   - processPath;
     *   - processString;
     *   - use;
     */

    /**
     * Loads configuration from JSON.
     * Activates and configures required options.
     *
     * @param {Object} config
     * @returns {Object} Comb's object (that makes the method chainable).
     */
    that.configure = function configure(config) {
        _this.handlers = [];
        _this.configuredOptions = {};
        _this.verbose = config.verbose;
        _this.lint = config.lint;
        _this.exclude = (config.exclude || []).map(function(pattern) {
            return new minimatch.Minimatch(pattern);
        });

        _this.optionsOrder.forEach(function(optionName) {
            if (config[optionName] === undefined) return;

            try {
                _this.addHandler(_this.options[optionName], config[optionName]);
            } catch (e) {
                // Show warnings about illegal config values only in verbose mode:
                if (_this.verbose) {
                    console.warn('\nFailed to configure "%s" option:\n%s',
                                 optionName, e.message);
                }
            }
        });

        return that;
    };

    that.getOptionsOrder = function getOptionsOrder() {
        return _this.optionsOrder.slice();
    };

    that.getSyntax = function getSyntax() {
        return that.syntax;
    };

    /**
     * Gets option's value.
     *
     * @param {String} optionName
     * @returns {String|Boolean|undefined}
     */
    that.getValue = function getValue(optionName) {
        return _this.configuredOptions[optionName];
    };

    /**
     * @param {String} path
     * @returns {Promise}
     */
    that.lintDirectory = function lintDirectory(path) {
        var lint = _this.lint;
        _this.lint = true;
        return that.processDirectory(path).then(function(errors) {
            _this.lint = lint;
            return errors;
        });
    };

    /**
     * @param {String} path
     * @returns {Promise}
     */
    that.lintFile = function lintFile(path) {
        var lint = _this.lint;
        _this.lint = true;
        return that.processFile(path).then(function(errors) {
            _this.lint = lint;
            return errors;
        });
    };

    /**
     * @param {String} path
     * @returns {Promise}
     */
    that.lintPath = function lintPath(path) {
        var lint = _this.lint;
        _this.lint = true;
        return that.processPath(path).then(function(errors) {
            _this.lint = lint;
            return errors;
        });
    };

    /**
     * @param {String} text
     * @param {{context: String, filename: String, syntax: String}} options
     * @returns {Array} List of found errors
     */
    that.lintString = function lintString(text, options) {
        var lint = _this.lint;
        _this.lint = true;
        var errors = that.processString(text, options);
        _this.lint = lint;
        return errors;
    };

    /**
     * Processes directory recursively.
     *
     * @param {String} path
     * @returns {Promise}
     */
    that.processDirectory = function processDirectory(path) {
        return vfs.listDir(path).then(function(filenames) {
            return vow.all(filenames.map(function(filename) {
                var fullname = path + '/' + filename;
                return vfs.stat(fullname).then(function(stat) {
                    if (stat.isDirectory()) {
                        return _this.shouldProcess(fullname) && that.processDirectory(fullname);
                    } else {
                        return that.processFile(fullname);
                    }
                });
            })).then(function(results) {
                return [].concat.apply([], results);
            });
        });
    };

    /**
     * Processes single file.
     *
     * @param {String} path
     * @returns {Promise}
     */
    that.processFile = function processFile(path) {
        if (!_this.shouldProcessFile(path)) return;
        return vfs.read(path, 'utf8').then(function(data) {
            var syntax = path.split('.').pop();
            var processedData = that.processString(data, { syntax: syntax, filename: path });

            if (_this.lint) return processedData;

            if (data === processedData) {
                if (_this.verbose) console.log(' ', path);
                return 0;
            }

            return vfs.write(path, processedData, 'utf8').then(function() {
                if (_this.verbose) console.log('✓', path);
                return 1;
            });
        });
    };


    /**
     * Processes directory or file.
     *
     * @param {String} path
     * @returns {Promise}
     */
    that.processPath = function processPath(path) {
        path = path.replace(/\/$/, '');

        return vfs.exists(path).then(function(exists) {
            if (!exists) {
                console.warn('Path ' + path + ' was not found.');
                return;
            }
            return vfs.stat(path).then(function(stat) {
                if (stat.isDirectory()) {
                    return that.processDirectory(path);
                } else {
                    return that.processFile(path);
                }
            });
        });
    };

    /**
     * Processes a string.
     *
     * @param {String} text
     * @param {{context: String, filename: String, syntax: String}} options
     * @returns {String} Processed string
     */
    that.processString = function processString(text, options) {
        var syntax = options && options.syntax;
        var filename = options && options.filename || '';
        var context = options && options.context;
        var tree;

        if (!text) return _this.lint ? [] : text;


        if (!syntax) syntax = 'css';
        that.syntax = syntax;

        try {
            tree = gonzales.parse(text, { syntax: syntax, rule: context });
        } catch (e) {
            var version = require('../package.json').version;
            var message = filename ? [filename] : [];
            message.push(e.message);
            message.push('CSScomb Core version: ' + version);
            e.stack = e.message = message.join('\n');
            throw e;
        }

        if (_this.lint) {
            return _this.lintTree(tree, filename);
        } else {
            return _this.processTree(tree).toCSS(syntax);
        }
    };


    /**
     *
     * @param {Object} option
     * @returns {Object} Comb's object
     */
    that.use = function use(option) {
        var name;

        if (typeof option !== 'object') {
            throw new Error('Can\'t use option because it is not an object');
        }

        name = option.name;
        if (typeof name !== 'string' || !name) {
            throw new Error('Can\'t use option because it has invalid name: ' +
                            name);
        }

        if (typeof option.accepts !== 'object' &&
            typeof option.setValue !== 'function') {
            throw new Error('Can\'t use option "' + name + '"');
        }

        if (typeof option.process !== 'function') {
            throw new Error('Can\'t use option "' + name + '"');
        }

        _this.updateOptionOrder(option);

        return that;
    };

    _this.usePredefinedOptions();
};

module.exports = Comb;

