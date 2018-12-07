/*eslint no-console:0*/
'use strict';
const tw = require('time-windowing');

const ONE_DAY = 24 * 60 * 60 * 1000; // milliseconds
const ONE_MINUTE = 60 * 1000;        // milliseconds

// State object to be stored and analyzed
class HeartRateReading {
    constructor(timestamp) {
        this.beatsPerMinute = HeartRateReading.createRandomHeartRate();
        this.timestamp = timestamp; 
    }

    static createRandomHeartRate() {
        return Math.floor(Math.random() * (90 - 60 + 1)) + 60;
    }
}

// Generate (simulated) time-ordered array of HeartRate readings, one per minute:
const readings = [];
for (let timestamp = Date.now() - ONE_DAY; timestamp < Date.now(); timestamp += ONE_MINUTE) {
    tw.addToOrdered(readings, r => r.timestamp, new HeartRateReading(timestamp));
}

// Given heart-rate readings every minute, calculate the 5-minute
// moving average of a person's heart rate for the past 24 hours.
const slidingWindows = tw.toSlidingWindows(
    readings,                      // array to transform
    reading => reading.timestamp,  // how to pull the time out of a HeartRateReading object
    5 * ONE_MINUTE,                // size (duration) of window: 5 minutes (in millis)
    ONE_MINUTE,                    // frequency of windows: 1 minute (in millis)
    Date.now() - ONE_DAY,          // start time of first sliding window.
    Date.now()                     // end time of last window
);


// Print each window's boundaries and its heartbeat average:
for (const win of slidingWindows) {
    const sum = win.reduce((total, reading) => total + reading.beatsPerMinute, 0);
    const avg = sum / win.length;

    console.log(`${win.startDate.toLocaleTimeString()} - ${win.endDate.toLocaleTimeString()}: ${avg}`);
}

// Output:
// 4:54:56 PM - 4:59:56 PM: 76.2
// 4:55:56 PM - 5:00:56 PM: 71.6
// 4:56:56 PM - 5:01:56 PM: 72.4
// ...
