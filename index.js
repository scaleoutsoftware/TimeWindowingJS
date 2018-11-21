'use strict';
const TimeWindow = require('./timeWindow');

/**
 * User-supplied callback function that extracts a timestamp from an event.
 * @callback TimestampSelector
 * @param {any} event - Object representing an event.
 * @returns {number} The time that the event argument occurred, represented as milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 */


/**
 * 
 * @param {Array} arr - source array of time-ordered elements to transform.
 * @param {TimestampSelector} timestampSelector - function to extract a timestamp from an element.
 * @param {number} start - start time (inclusive) of the first sliding window. If undefined, the timestamp of the array's first element will be used.
 * @param {number} end - end time (exclusive) for the last of sliding window(s). If undefined, a timestamp of one millisecond after the array's last element will be used.
 * @param {number} windowDuration - Duration of each time window in milliseconds. This is a maximum value that will be shortened for the last window(s) in the returned sequence (see remarks).
 * @param {number} every - the period of time, in milliseconds, between the start of each sliding window.
 */
function* toSlidingWindows(arr, timestampSelector, start, end, windowDuration, every) {
    if (!Array.isArray(arr)) {
        throw new TypeError('arr must be an Array instance');
    }
    if (timestampSelector == null) {
        throw new TypeError('timestampSelector cannot be null/undefined.');
    }
    if (arr.length === 0) {
        return;
    }

    if (start == null) {
        start = timestampSelector(arr[0]);
    }
    if (end == null) {
        // add a millisecond to the last item's timestamp, otherwise it won't be included.
        end = timestampSelector(arr[arr.length -1]) + 1;
    }
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        throw new TypeError('start and end time arguments must be integers (typically milliseconds elapsed since January 1, 1970 00:00:00 UTC.');
    }
    
    let windowStart = start;
    let startingIndexHint = 0;
    while (windowStart < end) {
        let actualDur = windowDuration;

        if ((windowStart + windowDuration) > end)
            actualDur = end - windowStart;

        const win = new TimeWindow(arr, windowStart, windowStart + actualDur, startingIndexHint, timestampSelector);
        yield win;

        windowStart = windowStart + every;
        startingIndexHint = win.sourceIndex;
    }
}

/**
 * Adds one or more elements to a time-ordered array of items, inserting them in chronological order.
 * @param {Array} arr - destination array for new element(s).
 * @param {TimestampSelector} timestampSelector - function to extract a timestamp from an element.
 * @param {...any} values - value(s) to add to the array.
 */
function addToOrdered(arr, timestampSelector, ...values) {
    if (!Array.isArray(arr)) {
        throw new TypeError('arr must be an Array instance');
    }
    if (timestampSelector == null) {
        throw new TypeError('timestampSelector cannot be null/undefined.');
    }

    for (let i = 0; i < values.length; i++) {
        const timestamp = timestampSelector(values[i]);
        if (timestamp == null) {
            throw new Error('timestampSelector returned null/undefined.');
        }

        let insertPosition = arr.length;
        while (insertPosition > 0) {
            if (timestamp < timestampSelector(arr[insertPosition - 1]))
                insertPosition--;
            else
                break;
        }
        arr.splice(insertPosition, 0, values[i]);
    }
}

/**
 * Adds one or more elements to a time-ordered array of items, inserting them in chronological order. If
 * the size of the destination array exceeds the supplied maxArraySize argument, the oldest elements in
 * the destination array will be evicted.
 * @param {Array} arr - destination array for new element(s).
 * @param {number} maxArraySize - max allowed size of destination array before eviction begins.
 * @param {TimestampSelector} timestampSelector - function to extract a timestamp from an element.
 * @param {...any} values - value(s) to add to the array.
 */
function addToOrderedAndEvictOldest(arr, maxArraySize, timestampSelector, ...values) {
    if (!Number.isInteger(maxArraySize) || maxArraySize <= 0) {
        throw new RangeError('maxArraySize must be a positive integer.');
    }

    addToOrdered(arr, timestampSelector, ...values);

    const removeCount = arr.length - maxArraySize;
    if (removeCount > 0) {
        removeFirstItems(arr, removeCount);
    }
}

/**
 * Adds one or more elements to a time-ordered array of items, inserting them in chronological order. Any
 * elements in the array with timestamp prior to the supplied startTime argument will be evicted from the 
 * destination array.
 * @param {Array} arr - destination array for new element(s).
 * @param {Date|number} startTime - start time (inclusive) of the first allowed element in the destination array.
 * @param {TimestampSelector} timestampSelector - function to extract a timestamp from an element.
 * @param {...any} values - value(s) to add to the array.
 */
function addToOrderedAndEvictBefore(arr, startTime, timestampSelector, ...values) {
    addToOrdered(arr, timestampSelector, ...values);
    
    // find index of first element to keep.
    let removeCount = 0;
    while (removeCount < arr.length)
    {
        if (timestampSelector(arr[removeCount]) < startTime)
            removeCount++;
        else
            break;
    }

    if (removeCount > 0)
        removeFirstItems(arr, removeCount);
}

/**
 * Perform in-place removal of the first N elements in an array.
 * @param {Array} arr - array to be modified.
 * @param {number} count - Number of elements to remove from the front of the array.
 */
function removeFirstItems(arr, count) {
    if (!Array.isArray(arr)) {
        throw new TypeError('arr must be an Array instance');
    }
    if (!Number.isInteger(count) || count < 0 || count > arr.length) {
        throw new RangeError('count must be a positive integer.');
    }
    if (count > arr.length) {
        throw new RangeError('count cannot be larger than array\'s length');
    }

    if (count === 1) {
        arr.shift();
    }
    else if (count >= 1) {
        // Instead of repeatedly making the expensive shift() call,
        // we manually shift elements in a single pass:
        for (let from = count, to = 0; from < arr.length; from++, to++) {
            arr[to] = arr[from];
        }
        // Use Array.length to truncate leftover elements:
        arr.length = arr.length - count;
    }

}

module.exports = {
    toSlidingWindows: toSlidingWindows,
    addToOrdered: addToOrdered,
    addToOrderedAndEvictOldest: addToOrderedAndEvictOldest,
    addToOrderedAndEvictBefore: addToOrderedAndEvictBefore,
    removeFirstItems: removeFirstItems
};