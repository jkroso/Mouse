define(function () {

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
                e.stopPropagation()
                e.stopImmediatePropagation()
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
            e.stopPropagation()
            e.stopImmediatePropagation()
        }
    }

    return Button
})