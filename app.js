'use strict';

const http = require('http');
const express = require('express');
const expressBodyParser = require('body-parser');
const path = require('path');
const expressBunyanLogger = require('express-bunyan-logger');
const logger = require('./main/logger').getLogger();
const {HTTPError} = require('./main/error/httperror.class');
const {emitter, EVENTS} = require('./main/appevents');

const app = express();
const env = app.get('env');

app.set('port', process.env.PORT || 3000);
app.use(expressBunyanLogger());
app.use(expressBodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//API
const cacheapi = require('./main/cache/cache.routes');
app.use('/v1', cacheapi);

app.use((req, res, next) => {
    next(new HTTPError('Not Found', 404));
});

// Error middleware
const errorMiddleware = require('./main/error/error.middleware');
app.use(errorMiddleware);

const server = http.createServer(app);
server.listen(app.get('port'), () => {

    logger.info('Express server listening on port ' + app.get('port'));
    logger.info('Service url: http://localhost:' + app.get('port'));

    emitter.emit(EVENTS.STARTUP_COMPLETE);
});

process.on('uncaughtException', async (err) => {
    logger.fatal('Uncaught Exception - Service is exiting: %s', err.message );
    logger.fatal(err.stack);

    // use until this will be implemented in banyan
    // https://github.com/trentm/node-bunyan/issues/95
    setTimeout(() => process.exit(1), 1000);
});

module.exports = {
    api: app
};
