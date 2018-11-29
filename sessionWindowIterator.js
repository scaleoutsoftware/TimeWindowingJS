'use strict';

const TimeWindow = require('./timeWindow');

const _sourceArray = Symbol('_sourceArray');

/** 
 * Iterable collection of TimeWindow instances, broken up by session.
 * @hideconstructor
 */
class SessionWindowIterator {
    constructor(sourceArray, timestampSelector, idleThreshold) {
        this[_sourceArray] = sourceArray;
        this.timestampSelector = timestampSelector;
        this.idleThreshold = idleThreshold;
    }

    *[Symbol.iterator]() {
        const sourceArray = this[_sourceArray];
        let currentWindow = undefined;

        for (let i = 0; i < sourceArray.length; i++) {
            const elem = sourceArray[i];
            const timestamp = this.timestampSelector(elem);

            if (currentWindow === undefined) {
                // we're processing the first item in source collection
                currentWindow = new TimeWindow(sourceArray, timestamp, timestamp, i, this.timestampSelector, true);
            }
            else {
                
                if (timestamp - currentWindow.end > this.idleThreshold) {
                    // idle threshold exceeded; yield current window and create new one.
                    yield currentWindow;
                    currentWindow = new TimeWindow(sourceArray, timestamp, timestamp, i, this.timestampSelector, true);
                }
                else {
                    currentWindow.end = timestamp;
                }
            }
        }

        // close out the last session window:
        if (currentWindow != null)
        {
            yield currentWindow;
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

module.exports = SessionWindowIterator;