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

describe('Tumbling Window Tests', function() {

    it('simple tumbling', function() {
        const start = new Date(2018, 0, 1);
        const end = new Date(2018, 0, 5);
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming 2-day tumbling transform over Jan [1,5):
        * 
        * [-)      1,2
        *   [-)    3,4
        * |||||    
        * 12345
        **/
        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toTumblingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            start.valueOf(), 
            end.valueOf());

        assert.strictEqual(2, res.length);

        const first = res[0].toArray();
        assert.strictEqual(2, first.length);
        assert.strictEqual(first[0].payload, 1);
        assert.strictEqual(first[1].payload, 2);
        const second = res[1].toArray();
        assert.strictEqual(2, second.length);
        assert.strictEqual(second[0].payload, 3);
        assert.strictEqual(second[1].payload, 4);
    });

    it('default start and end', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming 2-day tumbling transform over Jan [1,5]:
        * 
        * [-)      1,2
        *   [-]    3,4,5
        * |||||    
        * 12345
        **/
        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toTumblingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay);

        assert.strictEqual(2, res.length);

        const first = res[0].toArray();
        assert.strictEqual(2, first.length);
        assert.strictEqual(first[0].payload, 1);
        assert.strictEqual(first[1].payload, 2);
        const second = res[1].toArray();
        assert.strictEqual(3, second.length);
        assert.strictEqual(second[0].payload, 3);
        assert.strictEqual(second[1].payload, 4);
        assert.strictEqual(second[2].payload, 5);

    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


