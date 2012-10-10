## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jkroso/Mouse/master/dist/Mouse.min.js
[max]: https://raw.github.com/jkroso/Mouse/master/lib/Observer.js

Provides a `Mouse` class, which in most cases there should only be a single instance of. `Mouse` is automatically instantiated on the window and tracks the mouse state independent of specific elements.

## About
Browsers provide plenty of hooks into mouse activity however the API is not particularly nice, nore is it complete. This library sets itself up listening to all mouse events occuring on the window object. It then uses these events to update a global object Mouse with all the information you need to understand the state of the mouse at any given time during the life cycle of your app. Furthermore, what happens when you combine this nice information about state with the ability to create custom events in modern browsers. The opportunity to morph the W3C spec into whatever you think it should have been. Mouse takes advantage of this opportunity and adds a few new events while augmenting those which the W3C got right with just a little more description.

New event types include:
* Drag
* Drop
* Grab

To take advantage of these events though you need to use a DOM library plugin which understands the format in which Mouse describes its events. One such plugin is [Dom411][domal]

[domal]: https://raw.github.com/jkroso/Dom411

## Why
The better your events the less code need

## Performance
My tests show that Mouse causes a 40-65% speed decrease for event heavy tasks such as mouse dragging in chrome. Firefox must have a higher cost of binding and unbinding events to the DOM (with Dom411 that doesn't often happen) as it showed less of a performance drop at 10-65%.  
I tested with short drags of 50px and long drags of 500px. The ranges shown can be read as short-long%. Suprisingly delegated events seems to be as fast if not faster than directly bound events in these tests.

##Example
This library alone can't do much but check out the [demo][demo] to see it in action when combined with a DOM library and appropriate event manager

[demo]: https://raw.github.com/jkroso/tree/master/demo

## API
To inspect the state of the mouse you only need to look at the properties of the relevant mouse instance. Which in most cases will be the `Mouse` object returned from the module definition.  

* __new Mouse(view)__: initializes mouse instance for given view. This is done automatically for the main window, but this could be run on, for example, an iframe's window to provide a mouse object scoped to that iframe.

more docs to come

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman  
Licensed under the MIT license.
