# ScaleOut Time Windowing Library for JavaScript

The ScaleOut Time Windowing Library for JavaScript provides a set of
windowing functions for time-ordered arrays of events.

`npm install time-windowing`

Documentation: https://scaleoutsoftware.github.io/TimeWindowingJS/

## Motivation

This time windowing library was written by ScaleOut Software to
support stateful stream processing in its
[StreamServer](https://www.scaleoutsoftware.com/products/streamserver/)
[Digital Twin Builder](https://www.scaleoutsoftware.com/products/digital-twin-builder/)
products, which allow events to be processed directly on the
distributed in-memory data grid that manages state.

Events associated with persisted state are typically stored as a
JSON-serialized array of events, so the functions are designed to be
used with time-ordered events held in a JavaScript Array.

This library is open source and has no dependencies on other ScaleOut 
Software products. 

License: Apache 2 