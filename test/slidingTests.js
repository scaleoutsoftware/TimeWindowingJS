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
const math = require('mathjs');

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

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay,
            start.valueOf(), 
            end.valueOf());

        assert.strictEqual(4, res.length);

        const first = res[0].toArray();
        assert.strictEqual(2, first.length);
        const last = res[3].toArray();
        assert.strictEqual(1, last.length);

    });

    it('default start and end', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5]
        *    with period of 1 day and duration of 2 days
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    []    4,5
        * |||||    
        * 12345
        **/

        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(4, res.length);

        const first = res[0].toArray();
        assert.strictEqual(2, first.length);
        // Unlike the behavior when end date is explicitly provided to toSlidingWindows(),
        // the end time of the last window includes the final element (Jan. 5th).
        const last = res[3].toArray();
        assert.strictEqual(2, last.length);

    });

    it('mapped window', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5]
        *    with period of 1 day and duration of 2 days
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    []    4,5
        * |||||    
        * 12345
        **/

        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(4, res.length);

        const avg = math.mean(res[0].map(element => element.payload));
        assert.strictEqual(1.5, avg);
    });

    it('filtered window', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5]
        *    with period of 1 day and duration of 2 days
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    []    4,5
        * |||||    
        * 12345
        **/

        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(4, res.length);

        const filtered = res[2].filter(element => element.payload > 3);
        assert.strictEqual(1, filtered.length);
        assert.strictEqual(4, filtered[0].payload);
    });

    it('reduced window', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5]
        *    with period of 1 day and duration of 2 days
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    []    4,5
        * |||||    
        * 12345
        **/

        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(4, res.length);

        const reduced = res[3].reduce((accumulator, element) => element.payload + accumulator, 0);
        assert.strictEqual(9, reduced);
    });

    it('every and some values in window', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5]
        *    with period of 1 day and duration of 2 days
        * 
        * [-)      1,2
        *  [-)     2,3
        *   [-)    3,4
        *    []    4,5
        * |||||    
        * 12345
        **/

        const arr = [];
        for (let i = 1; i <= 5; i++) {
            const elem = new MyEvent(i, new Date(2018, 0, i));
            arr.push(elem);
        }

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(4, res.length);

        // Where res[3]'s payloads are [4,5]
        const allMoreThanThree = res[3].every(element => element.payload > 3);
        assert.strictEqual(true, allMoreThanThree);
        const allMoreThanFour = res[3].every(element => element.payload > 4);
        assert.strictEqual(false, allMoreThanFour);

        const someMoreThanFour = res[3].some(element => element.payload > 4);
        assert.strictEqual(true, someMoreThanFour);
    });

    it('empty window', function() {
        const oneDay = 24 * 60 * 60 * 1000; //in millis

        /* First 5 days in January.
        * Assuming sliding transform over Jan [1,5)
        *    with period of 1 day and duration of 2 days:
        * 
        * x   x
        * [-)     1
        *  [-)    {empty}
        *   [-)   {empty}
        *    []   {5}
        * |||||    
        * 12345
        **/
        const arr = [];
        arr.push(new MyEvent(1, new Date(2018, 0, 1)));
        arr.push(new MyEvent(5, new Date(2018, 0, 5)));

        const res = tw.toSlidingWindows(
            arr, 
            (e) => e.timestamp.valueOf(), 
            2 * oneDay,
            oneDay);

        assert.strictEqual(res.length, 4);
        assert.strictEqual(res[0].length, 1);
        assert.strictEqual(res[1].length, 0);
        assert.strictEqual(res[2].length, 0);
        assert.strictEqual(res[3].length, 1);

        assert.strictEqual(res[0].toArray()[0].payload, 1);
        assert.strictEqual(res[3].toArray()[0].payload, 5);
    });

});


class MyEvent {
    constructor(payload, timestamp) {
        this.payload = payload;
        this.timestamp = timestamp;
    }
}


