## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jkroso/Mouse/master/dist/Mouse.min.js
[max]: https://raw.github.com/jkroso/Mouse/master/lib/Observer.js

## Mouse
Provides a `Mouse` class, which in most cases there should only be a single instance of. `Mouse` is automatically instantiated on the window and tracks the mouse state independent of specific elements. It can and should be combined with you favourite DOM library to leverage the custom events it dispatches. The bundled plugin provides the following interface when combined with a jquery like library:
    
    $(element).on('down.left', function (e) {
        console.log(e.name)
    })
    $(element).off('down.left')

## Event Handling
The DOM event api is heavily augmented. Where mentioned button sub-types refers to one of:
* `left`
* `middle`
* `right`
* `left+middle`
* `left+right`
* `left+middle+right`
* `middle+right`

Top level event types include:
* __down__: mousedown. Has button sub-types
* __up__: mouseup. Has button sub-types
* __move__: mousemove, does not fire while any buttons are down
* __click__: click, up within 0.4s and on down target. Has button sub-types
* __double__: dblclick, fires on second down. Has button sub-types
* __leave__: when the mouse leaves the window entirely
* __enter__: when the mouse enters the window from outside
* __wheel__: mousewheel, has up/down sub-types
* __grab__: first move after a button is pressed and held. Has button sub-types
* __drag__: while any button is down, any movement triggers a drag event on the grab target. Has button sub-types
* __drop__: first button release after grab, e.target is the grab target. Has button sub-types

## API
To inspect the state of the mouse you only need to look at the properties of the relevant mouse instance. Which in most cases will be the `Mouse` object returned from the module definition.  

* __new Mouse(view)__: initializes mouse instance for given view. This is done automatically for main window, but this could be run on, for example, an iframe's window to provide a mouse object scope to the iframe.

more docs to come for event object and plugin interface

## Bundled plugin
The bundled plugin will work with jquery though is not reccommended as it will override standard features. It interface is:

* __mouse.on([types, context,] callback, [priority])__: add callback as listener for each type in types
* __mouse.off([types], [callback])__: remove callback from listeners for each type in types
* __mouse.once([types, context,] callback, [priority])__: add callback as listener for the first time each type in types fires, then removes it

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## Thanks
To Brandon Benvie for his project of the same name which provided most of the insperation

## License
Copyright (c) 2012 Jakeb Rosoman  
Licensed under the MIT license.
