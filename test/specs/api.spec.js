'use strict';

const buildPath = '../../';

const chai = require('chai');
const request = require('supertest');

const assert = chai.assert;
const expect = chai.expect;
const sinon = require('sinon');

const HTTP_CODES = {
    SUCCESS : 200,
    NOT_FOUND   : 404,
    BAD_REQUEST : 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500
};

describe('API2 Tests', function() {
    let sandbox;
    let appevents;
    let api;
    /*const cacheModel = require(buildPath + 'main/cache/cache.model');
    let keyToRemove;*/


    before((done) => {
        appevents = require(buildPath + 'main/appevents');

        appevents.emitter.once(appevents.EVENTS.ERROR, (err) => {
            done(err);
        });

        appevents.emitter.once(appevents.EVENTS.STARTUP_COMPLETE, async () => {
            try {
                done();
            } catch (err) {
                done(err);
            }
        });

        const app = require(buildPath + 'app');
        api = app.api;
    });

    beforeEach(async () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(async () => {
        sandbox.restore();
    });

    after(async () => {
        //todo add db cleanup
    });

    it("should get 404 on request to non existent route", function (done) {
        request(api).get('/')
            .expect(HTTP_CODES.NOT_FOUND)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                expect(res.body.status.message).equals('Not Found');

                done();
            });
    });

    it("should create new cache entry", function (done) {
        const key = 'testkey';
        request(api).get(`/v1/cache/${key}`)
            .expect(HTTP_CODES.SUCCESS)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                try {
                    assert.equal(res.body.data.key, key);
                } catch (err) {
                    return done(err);
                }

                done();
            });
    });

    it("should get all cache entries", function (done) {
        const key = 'testkey';
        request(api).get(`/v1/cache/${key}`)
            .expect(HTTP_CODES.SUCCESS)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                request(api).get(`/v1/caches`)
                    .expect(HTTP_CODES.SUCCESS)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }

                        try {
                            assert.isAbove(res.body.data.length, 0, 'data should be an array and above 0');
                        } catch (err) {
                            return done(err);
                        }

                        done();
                    });
            });

    });

});
