'use strict';

const TimeWindow = require('./timeWindow');

const _sourceArray = Symbol('_sourceArray');

/** 
 * Iterable collection of TimeWindow instances.
 * @hideconstructor
 */
class WindowIterator {
    constructor(sourceArray, timestampSelector, windowDuration, every, start, end) {
        this[_sourceArray] = sourceArray;
        this.timestampSelector = timestampSelector;
        this.windowDuration = windowDuration;
        this.every = every;

        if (start == null) {
            this.start = timestampSelector(sourceArray[0]);
        } else {
            this.start = start;
        }

        this.ignoreTrailingWindow = false;
        if (end == null) {
            // add a millisecond to the last item's timestamp and use it as the 
            // end time for this transform (we add a millisecond because the end time
            // on a window is exclusive--otherwise the last item wouldn't be included).
            this.end = timestampSelector(sourceArray[sourceArray.length -1]) + 1;
            this.ignoreTrailingWindow = true;
        }
        else {
            this.end = end;
        }
        if (!Number.isInteger(this.start) || !Number.isInteger(this.end)) {
            throw new TypeError('start and end time arguments must be integers (typically milliseconds elapsed since January 1, 1970 00:00:00 UTC.');
        }

        

    }

    *[Symbol.iterator]() {
        const sourceArray = this[_sourceArray];
        // Memoized starting point for next window (otherwise each window 
        // would need to traverse the entire source array).
        let startingIndexMemo = 0;
        let windowStart = this.start;

        while (windowStart < this.end) {
            let actualDur = this.windowDuration;

            if ((windowStart + this.windowDuration) > this.end)
                actualDur = this.end - windowStart;

            const win = new TimeWindow(sourceArray, windowStart, windowStart + actualDur, startingIndexMemo, this.timestampSelector);
            windowStart = windowStart + this.every;
            startingIndexMemo = win.sourceIndex;

            if (this.ignoreTrailingWindow && win.end === this.end && win.durationMillis === 1) {
                // this is an extra window that's an artifact of us adding an extra millisecond
                // to the end time the end is automatically calculated above. Don't yield it.
                continue;
            }

            yield win;
        }
    }

    /**
     * Returns elements in the iterable as an Array.
     * @returns {Array} The TimeWindow instance in a new Array.
     */
    toArray() {
        return Array.from(this);
    }


}

module.exports = WindowIterator;