const {HTTPError} = require('./httperror.class');
const logger = require('../logger').getLogger('ErrorMiddleware');

const middleware = (err, req, res, next) => {
    logger.error(err);

    if (err instanceof HTTPError) {
        res.status(err.httpCode || 500).json({
            status: err.status
        });
    } else {
        const errMessage = err && err.message ? err.message : err;
        res.status(500).json({
            status: {
                message: errMessage
            }
        });
    }
};

module.exports = middleware;