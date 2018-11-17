
'use strict';
const assert = require('assert');
const tw = require('../index');

describe('Array Management Tests', function() {

    it('should add item to empty array', function() {
        const arr = [];
        const element = new MyEvent('some value', Date.now());
        tw.addToOrdered(arr, (elem) => elem.timestamp, element);
        assert(arr.length === 1);
    });

    it('should only allow an array', function() {
        const element = new MyEvent('some value', Date.now());
        assert.throws(() => tw.addToOrdered(null, (elem) => elem.timestamp, element));
        assert.throws(() => tw.addToOrdered(undefined, (elem) => elem.timestamp, element));
        assert.throws(() => tw.addToOrdered('Supposed to be an array.', (elem) => elem.timestamp, element));
    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


