var str = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (data) {
    str += data;
});

process.stdin.on('end', function () {
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
});

