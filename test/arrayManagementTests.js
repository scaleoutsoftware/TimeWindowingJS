
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

    it('Evict old session', function() {
        const MAX_SESSION_COUNT = 2;
        const IDLE_THRESHHOLD = 10 * 60 * 1000; // 10 minutes

        // source array of date elements:
        const arr = [];
        const timestampSelector = elem => elem.valueOf();

        // add two sessions worth of data.
        for (let sec = 0; sec < 7; sec++) {
            tw.addToOrderedAndEvictSessions(arr, 
                MAX_SESSION_COUNT, 
                timestampSelector, 
                IDLE_THRESHHOLD,
                new Date(2018, 1, 1, 13, 45, sec)); // 1:45:00p - 1:45:06p
        }
        for (let sec = 0; sec < 11; sec++) {
            tw.addToOrderedAndEvictSessions(arr, 
                MAX_SESSION_COUNT, 
                timestampSelector, 
                IDLE_THRESHHOLD,
                new Date(2018, 1, 1, 14, 30, sec)); // 2:30:00pm - 2:30:10pm
        }

        // Start a third session that should trigger eviction of the first.
        tw.addToOrderedAndEvictSessions(arr, 
            MAX_SESSION_COUNT, 
            timestampSelector, 
            IDLE_THRESHHOLD,
            new Date(2018, 1, 1, 15, 30, 0)); // 3:30:00pm

        assert.strictEqual(arr.length, 12);
        const sessions = tw.toSessionWindows(arr, timestampSelector, IDLE_THRESHHOLD);
        assert.strictEqual(sessions.length, 2);

        const firstWindow = sessions[0].toArray();
        assert.deepEqual(firstWindow[0], new Date(2018, 1, 1, 14, 30, 0)); // 2:30:00pm

    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


