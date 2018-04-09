'use strict';

class HTTPError extends Error {
    constructor(message, httpCode = 500) {
        super(message);

        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(message)).stack;
        }

        this.status = {message};
        this.httpCode = httpCode;
    }
}

module.exports = {HTTPError};