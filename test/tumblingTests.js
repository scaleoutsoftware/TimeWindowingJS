'use strict';
const assert = require('assert');
const tw = require('../index');

describe('Tumbling Window Tests', function() {

    it('simple tumbling', function() {
        const oneHour = 60 * 60 * 1000; //in millis

        const events = createTestSessions(5);

        // Break into sessions , where a session completes after one 
        // hour of inactivity.
        const res = tw.toSessionWindows(
            events, 
            (e) => e.timestamp.valueOf(), 
            oneHour)
            .toArray();

        assert.strictEqual(5, res.length);
        const lastSession = res[4].toArray(); // payload: [0..24]
        assert.strictEqual(lastSession[0].payload, 20);
        assert.strictEqual(lastSession[4].payload, 24);
    });

});

function createTestSessions(count) {
    const arr = [];

    let payloadId = 0;
    // simulate session of 5 minutes of daily activity for {count} days.
    for (let day = 1; day <= count; day++) {
        for (let min = 0; min < 5; min++) {
            const elem = new MyEvent(payloadId, new Date(2018, 0, day, 12, min, 0));
            arr.push(elem);
            payloadId++;
        }
    }

    return arr;
}


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


