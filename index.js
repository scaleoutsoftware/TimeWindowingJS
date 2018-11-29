'use strict';
const WindowIterator = require('./windowIterator');
const SessionWindowIterator = require('./sessionWindowIterator');



/**
 * User-supplied callback that extracts a timestamp from an element in a time-ordered array of events.
 * 
 * @callback timestampSelector
 * @param {any} elem - Timestamped element in a time-ordered array of events.
 * @returns {number} The time that the elem argument occurred, represented as milliseconds elapsed since January 1, 1970 00:00:00 UTC.
 */

/**
 * Transforms an ordered array into an iterable collection of sliding windows. The source array must be sorted chronologically.
 * @param {Array} sourceArray - Array of time-ordered elements to transform.
 * @param {timestampSelector} timestampSelector - Function to extract a timestamp from elements in the source array.
 * @param {number} windowDuration - Duration of each time window in milliseconds. This is a maximum value that will be shortened for the last window(s) in the returned sequence.
 * @param {number} every - The period of time, in milliseconds, between the start of each sliding window.
 * @param {number} start - Start time (inclusive) of the first sliding window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC. If undefined, the timestamp of the array's first element will be used.
 * @param {number} end - End time (exclusive) for the last sliding window(s), expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC. If undefined, the timestamp of the array's last element will be used, and the last window's end time will be inclusive.
 * @returns {WindowIterator} An iterable collection of TimeWindow instances.
 */
function toSlidingWindows(sourceArray, timestampSelector, windowDuration, every, start, end) {
    if (!Array.isArray(sourceArray)) {
        throw new TypeError('sourceArray must be an Array instance');
    }
    if (typeof timestampSelector !== 'function') {
        throw new TypeError(timestampSelector + ' is not a function');
    }
    if (every == null || !Number.isInteger(every)) {
        throw new TypeError('The "every" argument must be an integer representing a duration in milliseconds.');
    }

    return new WindowIterator(sourceArray, timestampSelector, windowDuration, every, start, end);
}

/**
 * Transforms an ordered array into an iterable collection of non-overlapped, fixed-time windows. The source array must be sorted chronologically.
 * @param {Array} sourceArray - Array of time-ordered elements to transform.
 * @param {timestampSelector} timestampSelector - Function to extract a timestamp from elements in the source array.
 * @param {number} windowDuration - Duration of each time window in milliseconds. This is a maximum value that may be shortened for the last window in the returned sequence.
 * @param {number} start - Start time (inclusive) of the first sliding window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC. If undefined, the timestamp of the array's first element will be used.
 * @param {number} end - End time (exclusive) for the last sliding window(s), expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC. If undefined, the timestamp of the array's last element will be used, and the last window's end time will be inclusive.
 * @returns {WindowIterator} An iterable collection of TimeWindow instances.
 */
function toTumblingWindows(sourceArray, timestampSelector, windowDuration, start, end) {
    return toSlidingWindows(sourceArray, timestampSelector, windowDuration, windowDuration, start, end);
}

function toSessionWindows(sourceArray, timestampSelector, idleThreshold) {
    if (!Array.isArray(sourceArray)) {
        throw new TypeError('sourceArray must be an Array instance');
    }
    if (typeof timestampSelector !== 'function') {
        throw new TypeError(timestampSelector + ' is not a function');
    }
    if (idleThreshold == null || !Number.isInteger(idleThreshold)) {
        throw new TypeError('The "idleThreshold" argument must be an integer representing a duration in milliseconds.');
    }

    return new SessionWindowIterator(sourceArray, timestampSelector, idleThreshold);
}

/**
 * Adds one or more elements to a time-ordered array of items, inserting them in chronological order.
 * @param {Array} arr - destination array for new element(s).
 * @param {timestampSelector} timestampSelector - function to extract a timestamp from an element.
 * @param {...any} values - value(s) to add to the array.
 */
function addToOrdered(arr, timestampSelector, ...values) {
    if (!Array.isArray(arr)) {
        throw new TypeError('arr must be an Array instance');
    }
    if (typeof timestampSelector !== 'function') {
        throw new TypeError(timestampSelector + ' is not a function');
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
 * @param {timestampSelector} timestampSelector - function to extract a timestamp from an element.
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
 * @param {timestampSelector} timestampSelector - function to extract a timestamp from an element.
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
    if (!Number.isInteger(count) || count < 0) {
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
    toTumblingWindows: toTumblingWindows,
    toSessionWindows: toSessionWindows,
    addToOrdered: addToOrdered,
    addToOrderedAndEvictOldest: addToOrderedAndEvictOldest,
    addToOrderedAndEvictBefore: addToOrderedAndEvictBefore,
    removeFirstItems: removeFirstItems
};