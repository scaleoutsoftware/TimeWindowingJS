
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

    it('remove from front of empty', function() {
        const arr = [];
        tw.removeFirstItems(arr, 0);
        assert(arr.length === 0);
    });

    it('remove from front of one element', function() {
        const arr = [ 42 ];
        tw.removeFirstItems(arr, 1);
        assert(arr.length === 0);
    });

    it('remove from front of two elements', function() {
        const arr = [ 42, 43 ];
        tw.removeFirstItems(arr, 1);
        assert(arr.length === 1);
        assert(arr[0] === 43);
    });

    it('remove multiple from front', function() {
        const arr = [ 42, 43, 44 ];
        tw.removeFirstItems(arr, 2);
        assert(arr.length === 1);
        assert(arr[0] === 44);
    });

    it('Add and evict oldest', function() {
        const arr = [];
        const MAX_ARR_SIZE = 8;

        for (let day = 1; day <= 10; day++) {
            const element = new MyEvent(day, new Date(2018, 0, day));
            tw.addToOrderedAndEvictOldest(arr, MAX_ARR_SIZE, (elem) => elem.timestamp, element);
        }

        assert(arr.length === 8);
        // first two elements (1, 2) should have been evicted.
        assert(arr[0].payload === 3);
    });

    it('Add and evict before', function() {
        const arr = [];
        const evictBefore = new Date(2018, 0, 3);

        // add some entries
        for (let i = 1; i <= 10; i++) {
            const element = new MyEvent(i, new Date(2018, 0, i));
            tw.addToOrdered(arr, (elem) => elem.timestamp, element);
        }
        // add one last entry that does eviction of entries before Jan 3rd:
        tw.addToOrderedAndEvictBefore(arr, evictBefore, (elem) => elem.timestamp, new MyEvent(11, new Date(2018, 0, 11)));

        assert(arr.length === 9);
        // first two elements (1, 2) should have been evicted.
        assert(arr[0].payload === 3);
    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


