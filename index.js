'use strict';

/**
 * User-supplied callback function that extracts a timestamp from an event.
 * @callback TimestampSelector
 * @param {any} event - Object representing an event.
 * @returns {Date|number} The time (Date or number) that the event argument occurred.
 */

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
    addToOrdered: addToOrdered,
    addToOrderedAndEvictOldest: addToOrderedAndEvictOldest,
    addToOrderedAndEvictBefore: addToOrderedAndEvictBefore,
    removeFirstItems: removeFirstItems
};