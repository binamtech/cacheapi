'use strict';

const express = require('express');
const router = express.Router();
const cacheController = require('./cache.controller');
const {sendSuccess} = require('../apihelpers');

router.post('/cache', async (req, res, next) => {
    try {
        const {body: {data}} = req;
        const result = await cacheController.create(req, res, data);
        sendSuccess(req, res, result);
    } catch (err) {
        next(err);
    }
});

router.put('/cache/:id', async (req, res, next) => {
    try {
        const {body: {data}} = req;
        const result = await cacheController.update(req, res, req.params.id, data);
        sendSuccess(req, res, result);
    } catch (err) {
        next(err);
    }
});

router.get('/cache/:id', async (req, res, next) => {
    try {
        const result = await cacheController.read(req, res, req.params.id);
        sendSuccess(req, res, result);
    } catch (err) {
        next(err);
    }
});

router.get('/caches', async (req, res, next) => {
    try {
        const result = await cacheController.readAll(req, res);
        sendSuccess(req, res, result);
    } catch (err) {
        next(err);
    }
});

router.delete('/cache/:id', async (req, res, next) => {
    try {
        const result = await cacheController.delete(req, res, req.params.id);
        sendSuccess(req, res, result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;