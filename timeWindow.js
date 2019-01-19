/* Copyright 2019 ScaleOut Software, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _sourceArray = Symbol('_sourceArray');

/** 
 * Iterable class representing a collection of elements that fall within a time window. 
 * @hideconstructor
 */
class TimeWindow {
    constructor(sourceArray, start, end, isEndInclusive, sourceIndex, sourceCount) {
        /** @member {number} - Start time (inclusive) of the window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC.*/
        this.start = start;
        /** @member {number} - End time of the window, expressed as milliseconds elapsed since January 1, 1970 00:00:00 UTC. The object's inclusiveEnd field indicates whether the end is inclusive or exclusive.*/
        this.end = end;
        /** @member {bool} - Whether the end time is inclusive (true) or exclusive (false) */
        this.isEndInclusive = isEndInclusive;
        
        this[_sourceArray] = sourceArray;
        this.sourceIndex = sourceIndex;
        this.length = sourceCount;
    }

    *[Symbol.iterator]() {
        const sourceArray = this[_sourceArray];
        for (let i = 0; i < this.length; i++) {
            yield sourceArray[i + this.sourceIndex];
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
     * Get the end time of the window as a Date object. The object's inclusiveEnd
     * field indicates whether the end is inclusive or exclusive.
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
        //return this[_sourceArray].slice(this.sourceIndex, (this.sourceIndex + this.sourceCount));
        // Relies iterator and doesn't care about implementation... thus more maintainable:
        return Array.from(this);
    }

    /**
     * Function that produces an element for the new Array, taking three arguments: 
     *
     * @callback mapCallback
     * @param {any} currentValue - The current element in the TimeWindow being processed.
     * @param {number} [index] - The index of the current element being processed in the array.
     * @param {TimeWindow} [window] - The TimeWindow that map() was called upon.
     * @returns {any} Transformed element.
     */

    /**
     * Creates a new array with the results of calling a provided function
     * on every element in the calling TimeWindow instance.
     * @param {mapCallback} callbackfn - Function that produces an element of the new Array.
     * @param {any} [thisArg] - Optional. Value to use as <tt>this</tt> when executing callback.
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
        if (thisArg != null) {
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

    /**
     *  Predicate used to test each element the TimeWindow. Return true if the element satisifies the
     *  condition, false otherwise. Three arguments are provided to this callback: 
     *
     * @callback predicateCallback
     * @param {any} currentValue - The current element in the TimeWindow being tested.
     * @param {number} [index] - The index of the current element being processed in the array.
     * @param {TimeWindow} [window] - The TimeWindow being evaluated.
     * @returns {boolean} true if the element satisfies the condition, false otherwise.
     */

    /**
     * Creates a new array containing elements from the TimeWindow that pass the
     * test implemented by the provided function. 
     * @param {predicateCallback} callbackfn - Function is a predicate used to test each element of the array. Return true to keep the element, false otherwise.
     * @param {any} [thisArg] - Optional. Value to use as this when executing the callback.
     * @returns {Array} A new array with the elements that pass the test. If no elements pass the test, an empty array will be returned.
     */
    filter(callbackfn, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg != null) {
            T = thisArg;
        }

        const arr = [];
        let k = 0;
        for (const elem of this) {
            if (callbackfn.call(T, elem, k, this)) {
                arr.push(elem);
            }
            k++;
        }
        return arr;
    }

    /**
     *  Reducer function to execute on each element in the TimeWindow, taking four arguments:  
     *
     * @callback reduceCallback
     * @param {any} accumulator - The accumulator accumulates the callback's return values; it is the accumulated value previously returned in the last invocation of the callback, or initialValue, if supplied.
     * @param {any} currentValue - The current element in the TimeWindow being processed.
     * @param {number} [index] - The index of the current element being processed in the array.
     * @param {TimeWindow} [window] - The TimeWindow that reduce() was called upon.
     * @returns {any} The accumulating value that is eventually returned to the reduce() caller. This returned value is assigned to the accumulator, whose value is remembered across each iteration throughout the window and ultimately becomes the final, single resulting value.
     */

    /**
     * Executes the provided reducer function on each member of the TimeWindow, resulting in a single output value.
     * @param {reduceCallback} callbackfn - Function that executes each element in the TimeWindow and returns an accumulating value.
     * @param {any} [initialValue] - Optional. Value to use as the first argument to the first call of the callback. If no initial value is supplied, the first element in the window will be used. Calling reduce() on an empty window without an initial value is an error.
     * @returns {any} The accumulated value that results from the reduction.
     */
    reduce(callbackfn/*, initialValue*/) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let k = 0;
        let accumulator = undefined;
        let haveInitialValue = false;

        if (arguments.length >= 2) {
            accumulator = arguments[1];
            haveInitialValue = true;
        } else {
            haveInitialValue = false;
        }

        for (const elem of this) {

            if (k === 0 && !haveInitialValue) {
                // Don't invoke the callback for the zeroth element if no initialValue
                // is provided--it becomes the initial value and we move on to the next element.
                accumulator = elem;
            }
            else {
                // Normal path, invoking callback
                accumulator = callbackfn(accumulator, elem, k, this);
            }

            k++;
        }

        if (k === 0 && !haveInitialValue) {
            throw new TypeError('Reduce of empty TimeWindow with no initial value');
        }
        else {
            return accumulator;
        }

    }

    /**
     * The some() method tests whether at least one element in the TimeWindow passes the test 
     * implemented by the provided function. If the window is empty then the method will always return false.
     * @param {predicateCallback} callbackfn - Function to test for each element.
     * @param {any} [thisArg] - Optional. Value to use as this when executing the callback.
     * @returns {boolean} true if the callback function returns a truthy value for any array element; otherwise, false.
     */
    some(callbackfn, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg != null) {
            T = thisArg;
        }

        let k = 0;
        for (const elem of this) {
            if (callbackfn.call(T, elem, k, this)) {
                return true;
            }
            k++;
        }
        return false;
    }

    /**
     * The every() method tests whether all elements in the TimeWindow pass the test implemented 
     * by the provided function. If the window is empty then the method will always return true.
     * @param {predicateCallback} callbackfn - Function to test for each element.
     * @param {any} [thisArg] - Optional. Value to use as this when executing the callback.
     * @returns {boolean} true if the callback function returns a truthy value for every TimeWindow element; otherwise, false.
     */
    every(callbackfn, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg != null) {
            T = thisArg;
        }

        let k = 0;
        for (const elem of this) {
            if (!callbackfn.call(T, elem, k, this)) {
                return false;
            }
            k++;
        }
        return true;
    }

    /**
     * Returns the value of the first element in the TimeWindow that satisfies the provided testing function. Otherwise undefined is returned.
     * @param {predicateCallback} callbackfn - Function to test for each element.
     * @param {any} [thisArg] - Optional. Value to use as this when executing the callback.
     * @returns {any} The value of the first element in the TimeWindow that satisfies the provided testing function; otherwise, undefined is returned.
     */
    find(callbackfn, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg != null) {
            T = thisArg;
        }

        let k = 0;
        for (const elem of this) {
            if (callbackfn.call(T, elem, k, this)) {
                return elem;
            }
            k++;
        }
        return undefined;
    }

    /**
     * Function that is executed on each element in a TimeWindow, taking three arguments: 
     *
     * @callback forEachCallback
     * @param {any} currentValue - The current element in the TimeWindow being processed.
     * @param {number} [index] - The index of the current element being processed in the array.
     * @param {TimeWindow} [window] - The TimeWindow that forEach() was called upon.
     */

    /**
     * Executes a provided function once for each TimeWindow element.
     * @param {predicateCallback} callbackfn - Function to execute for each element.
     * @param {any} [thisArg] - Optional. Value to use as this when executing the callback.
     * @returns {undefined}
     */
    forEach(callbackfn, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callbackfn !== 'function') {
            throw new TypeError(callbackfn + ' is not a function');
        }

        let T = undefined;
        // If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg != null) {
            T = thisArg;
        }

        let k = 0;
        for (const elem of this) {
            callbackfn.call(T, elem, k, this);
            k++;
        }
    }

}

module.exports = TimeWindow;