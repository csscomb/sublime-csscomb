var str = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (data) {
    str += data;
});

process.stdin.on('end', function () {
    var npm;
    try {
        npm = require('npm');
        npm.load({ prefix: __dirname, loglevel: 'error' }, function(err, npm) {
            try {
                checkAndProcess();
            } catch (e) {
                installAndProcess();
            }
        });
    } catch (e) {
        process.stderr.write('Could not load npm. Please make sure your paths are set correctly in settings.');
    }

    // Check if installed version is outdated:
    function checkAndProcess() {
        var installedVersion = require('./node_modules/csscomb/package.json').version,
            requiredVersion = require('./package.json').dependencies.csscomb;
        if (installedVersion !== requiredVersion) installAndProcess();
        else processString();
    }

    function installAndProcess() {
        // Disable install logs:
        console.log = function() {};
        // Install csscomb package:
        npm.commands.install(['csscomb'], function() {
            processString();
        });
    }

    function processString() {
        var Comb = require('./node_modules/csscomb/lib/csscomb'),
            comb = new Comb(),
            syntax = process.argv[2],
            configPath = process.argv[3],
            config, combed;

        if (configPath) {
            config = require(configPath);
        } else {
            config = comb.getConfig('csscomb');
        }

        combed = comb.configure(config).processString(str, syntax);
        process.stdout.write(combed);
    }
});

