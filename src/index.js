var Button = require('./Button.js'),
    bitMask = [1, 2, 4]

module.exports = Mouse

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
    // this.down = null // `this.down` will become a singly linked list of active buttons
    this.buttons = 0
    this.lastActivity = Date.now()
    this.last = {x:0,y:0}
    
    // `this` will refer to a DOM element when triggered
    this.stateHandlers = {
        mousedown : function (e) {
            // Add the button to the front of a linked list of active buttons
            // if ( self.down )
                // e.previousDown = self.down
            // self.down = e
            self.buttons += bitMask[e.button]
            // Delegate the event to the correct button
            self[self.buttons].onDown(e)
            // self.sequence(e)
            self.update(e)
        },
        mouseup : function (e) {
            // Remove the corresponding down event from the daisy chain of active buttons
            // var downEvent = self.down
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

var proto = Mouse.prototype

// Start tracking
proto.on = function () {
    Object.keys(this.stateHandlers).forEach(function ( type ) {
        this.view.addEventListener(type, this.stateHandlers[type], true)
    }, this)
}

// Stop tracking
proto.off = function () {
    Object.keys(this.stateHandlers).forEach(function ( type ) {
        this.view.removeEventListener(type, this.stateHandlers[type], true)
    }, this)
}

proto.update = function (e) {
    this.last = e
    this.lastActivity = e.timeStamp
}

// function sequence (e) {
//     var result = [e.name]
//     while ( e.previous ) {
//         e = e.previous
//         result.unshift(e.name)
//     }
//     return result.join(',')
// }

Object.keys(proto).forEach(function(key) {
    Object.defineProperty(Mouse, key, { 
        value : proto[key] 
    })
    Object.defineProperty(proto, key, { enumerable: false })
})
// Why not re-use the constructor as an instance
Mouse.call(Mouse, window)

if ( typeof Window !== 'undefined' )
    Window.prototype.Mouse = Mouse