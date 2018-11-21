'use strict';

const _sourceArray = Symbol('_sourceArray');

/** 
 * Iterable class representing a collection of elements that fall within a time window. 
 * @hideconstructor
 */
class TimeWindow {
    constructor(sourceArray, start, end, sourceIndexHint, timestampSelector) {
        /** @member {number} - Start time (inclusive) of the window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC.*/
        this.start = start;
        /** @member {number} - End time (exclusive) of the window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC.*/
        this.end = end;
        
        this.sourceIndex = sourceIndexHint;
        this[_sourceArray] = sourceArray;
        this.timestampSelector = timestampSelector;

        // find index of first element in the underlying array
        // that this window spans
        for (this.sourceIndex = sourceIndexHint; this.sourceIndex < sourceArray.length; this.sourceIndex++) {
            if (timestampSelector(sourceArray[this.sourceIndex]) >= start) {
                break;
            }
        }
    }

    *[Symbol.iterator]() {
        const sourceArray = this[_sourceArray];
        for (let i = this.sourceIndex; i < sourceArray.length; i++) {
            if (this.timestampSelector(sourceArray[i]) < this.end) {
                yield sourceArray[i];
            }
            else {
                break;
            }
        }
    }

    /**
     * Get the start time (inclusive) of the window as a Date object.
     * @type {Date}
     * @readonly
     */
    get startDate() {
        return new Date(this.start);
    }

    /**
     * Get the end time (exclusive) of the window as a Date object.
     * @type {Date}
     * @readonly
     */
    get endDate() {
        return new Date(this.end);
    }

    /**
     * Get the duration of the window in milliseconds.
     * @type {number}
     * @readonly
     */
    get durationMillis() {
        return this.end - this.start;
    }

    /**
     * Returns elements in the window as an Array.
     * @returns {Array} The window's elements as a new Array.
     */
    toArray() {
        return Array.from(this);
    }
}

module.exports = TimeWindow;