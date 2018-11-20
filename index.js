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
    
    
}

module.exports = {
    addToOrdered: addToOrdered,
    addToOrderedAndEvictOldest: addToOrderedAndEvictOldest,
    addToOrderedAndEvictBefore: addToOrderedAndEvictBefore
};