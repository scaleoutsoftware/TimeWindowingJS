'use strict';
const assert = require('assert');
const tw = require('../index');

describe('Sliding Window Tests', function() {

    it('simple sliding', function() {
        const start = new Date(2018, 0, 1);
        const end = new Date(2018, 0, 5);
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5)
        *    with period of 1 day and duration of 2 days:
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    [)    4
        * |||||    
        * 12345
        **/
        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const slidingWindows = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            start.valueOf(), 
            end.valueOf(),
            2 * oneDay,
            oneDay);

        const res = Array.from(slidingWindows);
        assert.strictEqual(4, res.length);

        const first = Array.from(res[0]);
        assert.strictEqual(2, first.length);
        const last = Array.from(res[3]);
        assert.strictEqual(1, last.length);
    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


