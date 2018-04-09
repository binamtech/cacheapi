'use strict';

const logger = require('../logger').getLogger('CACHE');
const {HTTPError} = require('../error/httperror.class');

class Cache {
    constructor() {};

    async create(req, res, data) {
        return 'test';
    }

    async update(req, res, id, data) {
        return 'test';
    }

    async read(req, res, id) {
        return 'test';
    }

    async readAll(req, res, id) {
        return ['test'];
    }

    async delete(req, res) {
        return 'test';
    }
}

module.exports = new Cache();