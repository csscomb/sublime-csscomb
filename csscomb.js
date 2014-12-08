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
        config, combed;

    try {
        config = JSON.parse(process.argv[3]);
    } catch (e) {
        config = null;
    }

    process.chdir(process.argv[4]);

    config = Comb.getCustomConfig() ||
        config ||
        Comb.getConfig('csscomb');

    combed = comb.configure(config).processString(str, {syntax: syntax});
    process.stdout.write(combed);
});

