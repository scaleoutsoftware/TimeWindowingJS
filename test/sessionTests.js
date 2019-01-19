/* Copyright 2019 ScaleOut Software, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const assert = require('assert');
const tw = require('../index');

describe('Session Window Tests', function() {

    it('simple session', function() {
        const oneHour = 60 * 60 * 1000; //in millis

        const events = createTestSessions(5);

        // Break into sessions , where a session completes after one 
        // hour of inactivity.
        const res = tw.toSessionWindows(
            events, 
            (e) => e.timestamp.valueOf(), 
            oneHour);

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


