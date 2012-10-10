define([
    '../../Dom411/src/Dom411',
    '../src/Mouse'
], function (Dom411, Mouse) {'use strict';
    var total, timer, top, left

    // This causes just a single dom event listener
    Dom411('#list1')
        .delegate('.item', 'grab.left', start)
        .delegate('.item', 'drag.left', move)
        .delegate('.item', 'drop.left', stop)
    
    // This causes one listener to be bound to each list item
    Dom411('#list2 > .item')
        .on('grab.left', start)
        .on('drag.left', move)
        .on('drop.left', stop)

    function start (e) {
        timer = e.timeStamp
        total = 0
        top = parseInt(this.style.top, 10) || 0
        left = parseInt(this.style.left, 10) || 0
    }
    function stop (e) {
        var duration = e.timeStamp - timer
        document.getElementById('count').innerHTML = Math.round(total / (duration / 1000))
    }
    function move (e) {
        total++
        this.style.top = (top += e.movementY) + 'px'
        this.style.left = (left += e.movementX) + 'px'
    }

    Array.prototype.slice.call(document.querySelectorAll('#list3 > .item')).forEach(function (node) {
        node.addEventListener('mousedown', function (e) {
            var self = this
            start.call(this, e)
            var lastEvent = e
            document.body.addEventListener('mousemove', dragHandler, true)
            document.body.addEventListener('mouseup', mouseup, true)
            function mouseup (e) {
                stop(e)
                document.body.removeEventListener('mousemove', dragHandler, true)
                document.body.removeEventListener('mouseup', mouseup, true)
            }
            function dragHandler (e) {
                total++
                self.style.top = (top += e.clientY - lastEvent.clientY) + 'px'
                self.style.left = (left += e.clientX - lastEvent.clientX) + 'px'
                lastEvent = e
            }
        }, true)
    })

    // Using only native events, though, enhanced by jquery
    // $('#list3 > .item').on('mousedown', function (e) {
    //     start.call(this, e)
    //     lastEvent = e
    //     var dragHandler = jqMove.bind(this)
    //     $(document.body)
    //         .on('mousemove', dragHandler)
    //         .one('mouseup', function (e) {
    //             stop(e)
    //             $(document.body).off('mousemove', dragHandler)
    //         })
    // })
    // var lastEvent
    // function jqMove (e) {
    //     total++
    //     this.style.top = (top += e.clientY - lastEvent.clientY) + 'px'
    //     this.style.left = (left += e.clientX - lastEvent.clientX) + 'px'
    //     lastEvent = e
    // }
})