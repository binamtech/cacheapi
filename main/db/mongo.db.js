const util = require('util');
const MongoClient = require('mongodb').MongoClient;
const conf = require('../conf');

const url = conf.dbUrl;
const dbName = 'cachedb';
let client;
let dbo;

const connect = util.promisify(MongoClient.connect);

module.exports.getDB = async () => {

    if (!dbo) {
        client = await connect(url);
        dbo = client.db(dbName);
    }

    return dbo;
};

module.exports.close = () => {
    if (client) {
        client.close();
    }
};