'use strict';

function sendAPIResult (req, res, {httpCode = 200, result}) {
    res.status(httpCode).json(result);
}

function sendSuccess (req, res, data) {
    const result = {
        status: {
            code: 0
        }
    };

    result.data = data.data ? data.data : data;

    sendAPIResult(req, res, {
        httpCode: 200,
        result
    });
}

module.exports = {
    sendAPIResult,
    sendSuccess
};