'use strict';

const mongo = require('mongodb');
const logger = require('../logger').getLogger('CACHE-MODEL');
const conf = require('../conf');
const MongoDB = require('../db/mongo.db');

let dbo;
let collection;
const ttl = conf.ttl;

async function getCollection () {
    if (collection) {
        return collection;
    }

    if (!dbo) {
        try{
            dbo = await MongoDB.getDB();
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    return new Promise((resolve, reject) => {
        dbo.createCollection("cache", function(err, res) {
                if (err) {
                    logger.error(err);
                    reject(err);
                } else {
                    collection = res;
                    resolve(collection);
                }
            })
        })
        .then((c) => {
            return new Promise((resolve, reject) => {
                // Index createdAt_1 is used for entry expirationc
                c.createIndex( { "createdAt": 1 }, { expireAfterSeconds: ttl }, (err, indexName) => {
                    if (err) {
                        logger.error(err);

                        if (err.code === 85) {

                            // IndexOptionsConflict
                            c.dropIndex({"createdAt": 1}, (err) => {
                                if (err) {
                                    logger.error(err);
                                    reject(err);
                                } else {

                                    // recreate index
                                    c.createIndex( { "createdAt": 1 }, { expireAfterSeconds: ttl }, (err, indexName) => {
                                        if (err) {
                                            logger.error(err);
                                            reject(err);
                                        } else {
                                            logger.info(`A new expiration index ${indexName} with ttl=${ttl} seconds was recreated`);
                                            resolve(c);
                                        }
                                    })
                                }
                            });
                        }
                    } else {
                        logger.info(`Expiration index ${indexName} with ttl=${ttl} seconds was created`);
                        resolve(c);
                    }
                })
            });
        });
}

function getByKey (key) {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.findOne({key}, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        });
}

function getAll () {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.find({}).toArray((err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        });
}

/**
 * Insert new cache entry
 * If cache size is reached the maximum amount (conf.cacheSize) then oldest entry will be replaced by _id
 * @param key
 * @param value
 * @return {Promise<any>}
 */
function insert ({key, value}) {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.find({}).sort({'createdAt': -1}).toArray((err, cursor) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (cursor.length >= conf.cacheSize) {
                            resolve({c, _id: cursor[cursor.length - 1]._id});
                        } else {
                            resolve({c});
                        }
                    }
                });
            })

        })
        .then(({c, _id}) => {
            return new Promise((resolve, reject) => {
                if (_id) {
                    // replace
                    c.update({_id: new mongo.ObjectID(_id)}, { $set: {key, value, 'createdAt': new Date()} }, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            c.findOne({key}, (err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            })
                        }
                    })
                } else {
                    // insert new one
                    c.insert({key, value, 'createdAt': new Date()}, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            const {ops:[retVal]} = res;
                            resolve(retVal);
                        }
                    });
                }
            })
        });
}

function update ({key, value}) {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.update({key}, { $set: {value, 'createdAt': new Date()} }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        });
}

function updateTTL (key) {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.update({key}, { $set: {'createdAt': new Date()} }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        });
}

function remove (key) {
    return getCollection()
        .then((c) => {
            return new Promise((resolve, reject) => {
                c.deleteOne({key}, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })
        });
}

module.exports = {
    getByKey,
    insert,
    update,
    updateTTL,
    remove,
    getAll
};