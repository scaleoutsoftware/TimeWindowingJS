'use strict';

/**
 * User-supplied callback function that extracts a timestamp from an event.
 * @callback TimestampSelector
 * @param {any} event - Object representing an event.
 * @returns {Date|number} The time (Date or number) that the event argument occurred.
 */

/**
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

module.exports = {
    addToOrdered: addToOrdered,
};