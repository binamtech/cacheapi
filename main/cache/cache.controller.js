'use strict';

const uuid = require('uuid');
const logger = require('../logger').getLogger('CACHE');
const {HTTPError} = require('../error/httperror.class');
const cacheModel = require('./cache.model');

class Cache {
    constructor() {};

    async create(req, res, data) {
        const {key, value} = data;

        let result = await cacheModel.getByKey(key);
        if (result) {
            throw new HTTPError(`Cache entry with key=${key} already exists`, 400);
        }
        logger.info(result);

        result = await cacheModel.insert({key, value});

        return result;
    }

    async update(req, res, key, data) {
        const {value} = data;

        let result = await cacheModel.getByKey(key);
        if (!result) {
            throw new HTTPError(`Cache entry with key=${key} not found`, 404);
        }
        logger.info(result);

        result = await cacheModel.update({key, value});

        return result;
    }

    async read(req, res, key) {
        let result = await cacheModel.getByKey(key);

        if (!result) {
            logger.info('Cache miss');
            result = await cacheModel.insert({key, value: uuid.v4()});
        } else {
            logger.info('Cache hit');
            await cacheModel.updateTTL(key);
        }

        return result;
    }

    async readAll(req, res) {
        return await cacheModel.getAll();
    }

    async remove(req, res, key) {
        let result = await cacheModel.getByKey(key);
        if (!result) {
            throw new HTTPError(`Cache entry with key=${key} not found`, 404);
        }

        await cacheModel.remove(key);

        return result;
    }
}

module.exports = new Cache();