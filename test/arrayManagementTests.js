
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


    it('add mulitple items', function() {
        const arr = [];
        const jan1 = new MyEvent('event2', new Date(2018, 0, 2));
        const jan2 = new MyEvent('event1', new Date(2018, 0, 1));

        tw.addToOrdered(arr, (elem) => elem.timestamp, jan1, jan2);
        
        assert(arr.length === 2);
        assert(arr[0].payload === 'event1');
        assert(arr[1].payload === 'event2');
    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


