/*
 * This module configures logging.
 */

const argv = require('minimist')(process.argv);
const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const fs = require('fs');
const path = require('path');
const RotatingFileStream = require('bunyan-rotating-file-stream');

const formatOut = bunyanFormat({outputMode: 'bunyan', levelInString: true});
const logLevel = argv['logLevel'] || 'info';
let logFileName;
const streams = [];

const environment = process.env.NODE_ENV;
if (environment === 'development') {
    const PrettyStream = require('bunyan-prettystream');
    let prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    streams.push({
        level: logLevel,
        type: 'raw',
        stream: prettyStdOut
    });
} else {
    streams.push({
        // daemon-launcher will take care of moving this to log file
        level: logLevel,
        stream: formatOut
    });
}

const logPath = path.join(__dirname, '..', 'log');

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

if ('LOG_FILE_NAME' in process.env) {
    logFileName = process.env.LOG_FILE_NAME;
} else {
    logFileName = 'cache-api.%Y%m%d_%H%M%S_%L.log';
}

const logFullFileName = path.join(logPath, logFileName);

streams.push({
    level: logLevel,
    stream: new RotatingFileStream({
        path: logFullFileName,
        period: '1d',
        totalFiles: 10,
        rotateExisting: true,
        threshold: '100m',
        totalSize: 0,
        gzip: false,
        startNewFile: true
    })
});

const log = bunyan.createLogger({
    name: 'cache-api',
    streams
});

exports.getLogger = function (modName) {
    if (!modName) {
        return log; // no need to create child
    } else {
        return log.child({mod: modName});
    }
};
