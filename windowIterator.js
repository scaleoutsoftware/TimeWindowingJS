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

        this.isEndInclusive = false;
        if (end == null) {
            // Look at the last item's timestamp and use it as the 
            // end time for this transform (we also make the end date inclusive for the
            // final window(s)--otherwise the last item wouldn't be included).
            this.end = timestampSelector(sourceArray[sourceArray.length -1]);
            this.isEndInclusive = true;
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
        let nextWindowStart = this.start;

        while (nextWindowStart < this.end) {
            let actualDur = this.windowDuration;

            if ((nextWindowStart + this.windowDuration) > this.end)
                actualDur = this.end - nextWindowStart;

            const windowEnd = nextWindowStart + actualDur;
            const isLastWindow = ((nextWindowStart + this.every) < this.end) ? false : true;

            let isEndInclusive = false;
            if (this.isEndInclusive && isLastWindow) {
                // this window bumps up agains the final endDate, and the user is letting
                // the algorithm automatically pick the end time. In this particular
                // scenario, we make the end time of the final window inclusive.
                isEndInclusive = true;
            }

            const win = new TimeWindow(sourceArray, nextWindowStart, windowEnd, startingIndexMemo, this.timestampSelector, isEndInclusive);
            nextWindowStart = nextWindowStart + this.every;
            startingIndexMemo = win.sourceIndex;

            yield win;
        }
    }

    /**
     * Returns elements in the iterable as an Array.
     * @returns {Array} The TimeWindow instances in a new Array.
     */
    toArray() {
        return Array.from(this);
    }


}

module.exports = WindowIterator;