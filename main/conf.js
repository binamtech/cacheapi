'use strict';

class Conf {
    constructor() {}

    get ttl() {
        return 5; // sec
    }

    get cacheSize() {
        return 2;
    }

    get dbUrl() {
        return 'mongodb://localhost:27017';
    }
}

module.exports = new Conf();