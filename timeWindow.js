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

    /**
     * Function that produces an element for the new Array, taking three arguments: 
     *
     * @callback mapCallback
     * @param {number} currentValue - The current element in the TimeWindow being processed.
     * @param {string} [index] - The index of the current element being processed in the array.
     * @param {TimeWindow} [window] - The TimeWindow that map() was called upon.
     */

    /**
     * Creates a new array with the results of calling a provided function
     * on every element in the calling TimeWindow instance.
     * @param {mapCallback} callbackfn - Function that produces an element of the new Array.
     * @param {any} thisArg - Value to use as <tt>this</tt> when executing callback.
     * @returns {Array} A new array with each element being the result of the callback function.
     */
    map(callbackfn, thisArg) {
        // Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Polyfill

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg == null) {
            T = thisArg;
        }

        const arr = [];
        let k = 0;
        for (const elem of this) {
            // Let mappedValue be the result of calling the Call internal 
            // method of callback with T as the this value and argument 
            // list containing the window element, k, and the source TimeWindow.
            const mappedValue = callbackfn.call(T, elem, k, this);

            arr.push(mappedValue);
            k++;
        }
        return arr;
    }
}

module.exports = TimeWindow;