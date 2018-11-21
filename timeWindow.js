'use strict';

class TimeWindow {
    constructor(arr, start, end, sourceIndexHint, timestampSelector) {
        this.start = start;
        this.end = end;
        this.sourceIndex = sourceIndexHint;
        this.arr = arr;
        this.timestampSelector = timestampSelector;

        // find index of first element in the underlying array
        // that this window spans
        for (this.sourceIndex = sourceIndexHint; this.sourceIndex < arr.length; this.sourceIndex++) {
            if (timestampSelector(arr[this.sourceIndex]) >= start) {
                break;
            }
        }
    }

    *[Symbol.iterator]() {
        for (let i = this.sourceIndex; i < this.arr.length; i++) {
            if (this.timestampSelector(this.arr[i]) < this.end) {
                yield this.arr[i];
            }
            else {
                break;
            }
        }
    }
}

module.exports = TimeWindow;