/**
 * Event emitter to exchange events between app modules
 */

'use strict';

const {EventEmitter} = require('events');

exports.emitter = new EventEmitter();

exports.EVENTS = {
    STARTUP_COMPLETE    :  'startupcomplete',   // Startup sequence complete
    ERROR               :  'error'
};
