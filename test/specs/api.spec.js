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

});
