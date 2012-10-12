/*! Mouse - v0.1.0 - 2012-10-13
* https://github.com/jkroso/Mouse
* Copyright (c) 2012 Jakeb Rosoman; Licensed MIT */


define('Button',[],function () {

    function Button (which) {
        this.lastDown = {
            timeStamp : 0,
            x : 0,
            y : 0
        }
        this.lastUp = this.lastDown
        this.last = this.lastDown
        this.down = false
        this.dragging = false
        this.name = which
    }
    Button.prototype = {
        constructor : Button,
        onDown : function (e) {
            if ( e.target === this.lastDown.target && e.timeStamp - this.lastDown.timeStamp < 350 )
                e.types = ['double', this.name]
            else 
                e.types = ['down', this.name]

            this.lastActivity = e.timeStamp
            this.down = true
            this.last = this.lastDown = e
            e.name = 'down.'+this.name
        },
        onUp : function (e) {
            if ( this.dragging ) {
                this.dragging = false
                var event = new CustomEvent('library', {
                    bubbles : true,
                    cancelable : true
                })
                event.x = e.x
                event.y = e.y
                event.types = ['drop', this.name]
                event.name = 'drop.'+this.name
                this.lastDown.target.dispatchEvent(event)
            } else if ( e.target === this.lastDown.target && e.timeStamp - this.lastDown.timeStamp < 350 ) {
                e.types = [['click', [this.name]]]
            } else
                e.types = [['up', [this.name]]]
            
            this.down = false
            this.last = this.lastUp = e
            e.name = 'up.'+this.name
            return event || e
        },
        onMove : function (e) {
            var event
            if ( !this.dragging ) {
                // We need to publish a grab event separately before any other events as this will allow drag listeners to be added 
                this.dragging = true
                event = new Event('library', {
                    bubbles : true,
                    cancelable : true
                })
                event.x = this.lastDown.x
                event.y = this.lastDown.y
                event.types = ['grab', this.name]
                event.name = 'grab.'+this.name
                this.lastDown.target.dispatchEvent(event)
            }
            // When dragging the target should always be the one clicked on. To enable this to be true we need to create a custom event. I tried canceling the move event an re-dispatching it towards the correct target but this throws `DOM_exception error 1`
            event = new Event('library', {
                bubbles : true,
                cancelable : true
            })
            event.types = ['drag', this.name]
            // Movement is change in mouse position
            event.movementX = e.movementX
            event.movementY = e.movementY
            // Delta is the movement occuring on the button
            event.deltaX = (event.x = e.x) - this.last.x
            event.deltaY = (event.y = e.y) - this.last.y
            event.totalX = e.x - this.lastDown.x
            event.totalY = e.y - this.lastDown.y
            event.name = 'drag.'+this.name
            this.lastDown.target.dispatchEvent(event)
        }
    }

    return Button
});
// Mouse.js
// 
// Provides a `Mouse` class, which in most cases there should only be a single instance of. `Mouse` is automatically instantiated on the window and tracks the mouse state independent of specific elements. It also leverages this state and an _SignalTree_ dependency to provide an enhanced DOM event interface. To attatch an event use `element.on('down.left', function (e) {console.log(e.name)})`. To remove that event us `element.off('down.left')`

define('Mouse',['./Button'], function (Button) { 

    var bitMask = Object.freeze([1, 2, 4])

    function Mouse (view) {
        var self = this
        this.view = view
        this.x = 0
        this.y = 0
        this[1] = new Button('left')
        this[2] = new Button('middle')
        this[3] = new Button('left+middle')
        this[4] = new Button('right')
        this[5] = new Button('left+right')
        this[6] = new Button('middle+right')
        this[7] = new Button('left+middle+right')
        this.down = null // `this.down` will become a singly linked list of active buttons
        this.buttons = 0
        this.lastActivity = Date.now()
        this.last = {x:0,y:0},
        Object.defineProperties(this, {
            _beforeMove : {
                value : new Array, 
                writable: true
            },
            _beforeDrag : {
                value : new Array,
                writable : true
            }
        })
        
        // `this` will refer to a DOM element when triggered
        this.stateHandlers = {
            mousedown : function (e) {
                // Add the button to the front of a linked list of active buttons
                if ( self.down )
                    e.previousDown = self.down
                self.down = e
                self.buttons += bitMask[e.button]
                // Delegate the event to the correct button
                self[self.buttons].onDown(e)
                // self.sequence(e)
                self.update(e)
            },
            mouseup : function (e) {
                // Remove the corresponding down event from the daisy chain of active buttons
                var downEvent = self.down
                // if ( downEvent.which === e.which ) {
                //     self.down = downEvent.previousDown
                // } else {
                //     do {
                //         if ( downEvent.previousDown.which === e.which ) {
                //             downEvent.previousDown = downEvent.previousDown.previousDown
                //             break
                //         }
                //     } while ( downEvent = downEvent.previousDown )
                // }
                // Delegate the event to the correct button
                // self.sequence()
                self[self.buttons].onUp(e)
                self.buttons -= bitMask[e.button]
                self.update(e)
            },
            mousemove : function (e) {
                e.movementX = e.x - self.last.x
                e.movementY = e.y - self.last.y
                // Some browsers fire move events when they shouldn't
                if ( !(e.movementX || e.movementY) ) {
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    return
                }
                // If the mouse is being dragged
                if ( self.buttons ) {
                    self[self.buttons].onMove(e)
                }
                var moveEvents = ['move']
                
                if ( e.movementY > 0 )
                    moveEvents.push(['up'])
                else if ( e.movementY < 0 )
                    moveEvents.push(['down'])

                if ( e.movementX > 0 )
                    moveEvents.push(['right'])
                else if ( e.movementX < 0 )
                    moveEvents.push(['left'])
                    
                e.types = [moveEvents]
                
                self.x = e.x
                self.y = e.y
                self.update(e)
                
                // // Check if any actions are to be applied before the move event is published
                // if ( i = self._beforeMove.length ) {
                //     // De-ref the listener array now in case one of them mutates the array
                //     moveEvents = self._beforeMove // re-using the variable
                //     do {
                //         moveEvents[--i](e, self)
                //     } while ( i )
                // }
            },
            // drag : function (e) {
            //     var dragAspects = self._beforeDrag,
            //         i = dragAspects.length
            //     if ( i ) {
            //         do {
            //             dragAspects[--i](e, self)
            //         } while ( i )
            //     }
            // },
            mousewheel: function (e) {
                if ( e.wheelDelta > 0 )
                    e.types = [['wheel', ['up']]]
                else
                    e.types = [['wheel', ['down']]]
                
                if ( e.wheelDeltaX > 0 )
                    e.types[0].push(['left'])
                else if ( e.wheelDeltaX < 0 )
                    e.types[0].push(['right'])

                // self.sequence(e)
                self.update(e)
            },
            mouseover: function (e) {
                if ( e.relatedTarget === null ) {
                    self.active = true
                    self.update(e)
                }
                e.types = ['over']
                e.name = 'over'
            },
            mouseout: function (e) {
                if (e.relatedTarget === null) {
                    self.active = false
                    self.update(e)
                }
                e.types = ['out']
                e.name = 'out'
            }
            /*FIXEME: the contextmenu prevents any events from being triggerd if they occur over it. This often leads to miscalculated `mouse.buttons`.
            contextmenu : function (e) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
            }*/
        }

        this.on()
    }

    Mouse.prototype = {
        constructor : Mouse,
        // Start tracking
        on : function () {
            Object.keys(this.stateHandlers).forEach(function ( type ) {
                this.view.addEventListener(type, this.stateHandlers[type], true)
            }, this)
        },
        // Stop tracking
        off : function () {
            Object.keys(this.stateHandlers).forEach(function ( type ) {
                this.view.removeEventListener(type, this.stateHandlers[type], true)
            }, this)
        },
        // Maintain a singly linked list of successive events
        // sequence : function (e) {
        //     if ( e.timeStamp - this.lastActivity < 350 ) {
        //         e.previous = this.last
        //         e.types.push([sequence(e)])
        //     }
        // },
        update : function (e) {
            this.last = e
            this.lastActivity = e.timeStamp
        },

        // addAspect : function (type, action) {
        //     var array
        //     if ( typeof action !== 'function' )
        //         throw 'action must be a function'
        //     switch ( type ) {
        //         case 'move':
        //             array = this._beforeMove = this._beforeMove.slice()
        //             break
        //         case 'drag':
        //             array = this._beforeDrag = this._beforeDrag.slice()
        //             break
        //     }
        //     return array.unshift(action)
        // },
        
        // removeAspect : function (type, action) {
        //     var array
        //     switch ( type ) {
        //         case 'move':
        //             array = this._beforeMove.filter(function (func) {
        //                 return func === action || func.name === action
        //             })
        //             break
        //         case 'drag':
        //             array = this._beforeDrag.filter(function (func) {
        //                 return func === action || func.name === action
        //             })
        //             break
        //     }
        //     return array.length
        // }
    }

    // function sequence (e) {
    //     var result = [e.name]
    //     while ( e.previous ) {
    //         e = e.previous
    //         result.unshift(e.name)
    //     }
    //     return result.join(',')
    // }

    Object.keys(Mouse.prototype).forEach(function(key) {
        Object.defineProperty(Mouse, key, { 
            value : Mouse.prototype[key] 
        })
        Object.defineProperty(Mouse.prototype, key, { enumerable: false })
    })
    // Why not re-use the constructor as an instance
    Mouse.call(Mouse, window)
    
    if ( typeof Window !== 'undefined' )
        Window.prototype.Mouse = Mouse

    return Mouse
});