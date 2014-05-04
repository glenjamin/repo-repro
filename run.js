var fs = require('fs');
var os = require('os');
var path = require('path');
var http = require('http');
var crypto = require('crypto');
var exec = require('child_process').exec;

if (require.main === module) {
    var config = loadConfig();
    var app = createApp(config);
    app.start();
    process.on('SIGINT', app.stop);
    process.on('SIGTERM', app.stop);
}

function createApp(config) {
    var repro = createReproducer(config.temp, config.src, config.dest);
    var server = createServer(config.port, repro.sync);
    return {
        start: function() {
            repro.start();
            server.start();
        },
        stop: function() {
            repro.stop();
            server.stop();
        }
    }
}

function loadConfig() {
    var config = {};
    config.port = process.env.PORT || 1974;
    config.temp = process.env.TEMP_ROOT || os.tmpdir();
    config.src = requireEnv('SRC_REPO');
    config.dest = requireEnv('DEST_REPO');
    return config;
}

function requireEnv(key) {
    if (process.env[key]) {
        return process.env[key];
    }
    throw new Error('Missing required ' + key + ' environment variable');
}

function createServer(port, action) {
    var server = http.createServer(function(req, res) {
        action(function(err) {
            if (err) {
                res.statusCode = 500;
                res.write('ERROR!\n');
                res.end(err.stack);
            } else {
                res.end('OK');
            }
        })
    });
    return {
        start: function() {
            server.listen(port, function() {
                console.log("Listening on http://localhost:" + port);
            });
        },
        stop: function() {
            server.close();
        }
    };
}

/**
 * This is a bit of a mess
 *
 * Needs to extract the queue's control flow from actual program logic
 */
function createReproducer(temp, src, dest) {
    var dir = generateTempdir(temp);

    var running = false;
    var queued = [];

    function start() {
        fs.mkdir(dir, function(err) {
            if (err) throw err;

            running = true;
            initRepo(dir, src, function(err) {
                if (err) throw err;

                running = false;
                console.log("initial repo ready");
                process.nextTick(flushQueue);
            });
        });
    }

    function sync(callback) {
        queued.push(callback);
        if (!running) {
            process.nextTick(flushQueue);
        }
    }

    function flushQueue() {
        if (!queued.length) {
            return;
        }
        var callbacks = queued;
        queued = [];

        running = true;
        syncRepo(dir, src, dest, function(err) {
            callbacks.forEach(function(callback) {
                callback(err)
            })
            running = false;
            console.log("repo up to date");
            process.nextTick(flushQueue);
        })
    }

    return {
        start: start,
        stop: function() { /* nothing to stop */ },
        sync: sync
    }
}

function generateTempdir(root) {
    var subdir = crypto.pseudoRandomBytes(10).toString('hex');
    return path.join(root, subdir);
}

function initRepo(dir, src, callback) {
    var cmd = "git clone " + src + " --mirror " + dir;
    console.log("Initialising repo: " + cmd);
    exec(cmd, function(err, stdout, stderr) {
        stdout && console.log(stdout);
        stderr && console.warn(stderr);
        callback(err);
    });
}

function syncRepo(dir, src, dest, callback) {
    var fetch = "git remote -v update";
    var push  = "git push --mirror " + dest;
    console.log("Fetching remote repo: " + fetch);
    exec(fetch, {cwd: dir}, function(err, stdout, stderr) {
        stdout && console.log(stdout);
        stderr && console.warn(stderr);
        if (err) return callback(err);

        console.log("pushing to remote repo: " + push);
        exec(push, {cwd: dir}, function(err, stdout, stderr) {
            stdout && console.log(stdout);
            stderr && console.warn(stderr);
            callback(err);
        });
    })
}

