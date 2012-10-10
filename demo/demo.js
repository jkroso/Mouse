define([
    '../../Dom411/src/Dom411',
    '../vendor/happen',
    'require'
], function (Dom411, happen, require) {
    'use strict';
    var total, timer, top, left

    // This causes just a single dom event listener
    Dom411('#Direct')
        .on('grab.left', start)
        .on('drag.left', move)
        .on('drop.left', stop)
    
    // This causes one listener to be bound to each list item
    Dom411('#Delegated > .item')
        .delegate('.item', 'grab.left', start)
        .delegate('.item', 'drag.left', move)
        .delegate('.item', 'drop.left', stop)

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

    Array.prototype.slice.call(document.querySelectorAll('#Native > .item')).forEach(function (node) {
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
    
    function simulateDrag (element, direction, iterations) {
        var box = element.getBoundingClientRect()
        var mouse = {
            x: (box.left + box.right) / 2,
            y: (box.top + box.bottom) / 2
        }
        happen.mousedown(element, {
            clientX: mouse.x,
            clientY: mouse.y,
            button:0
        })
        while (iterations-- >= 0) {
            happen.mousemove(element, {
                clientX: mouse.x += direction.x,
                clientY: mouse.y += direction.y,
                button:0
            })
        }
        happen.mouseup(element, {
            clientX: mouse.x,
            clientY: mouse.y,
            button:0
        })
    }
    function timeDrag (el, cycles , distance) {
        var start = Date.now()
        console.time(el.parentElement.id)
        while (cycles-- >= 0 ) {
            simulateDrag(el, {x:1,y:1}, distance)
            simulateDrag(el, {x:-1,y:-1}, distance)
        }
        console.timeEnd(el.parentElement.id)
        return Date.now() - start
    }

    document.getElementById('Native').innerHTML += '<div class="result">Completed 100 - grab, move:50px, drop - cycles in '+
        timeDrag(document.getElementById('Native').children[0], 100, 50)+
        ' ms</div>'
    document.getElementById('Native').innerHTML += '<div class="result">Completed 100 - grab, move:500px, drop - cycles in '+
        timeDrag(document.getElementById('Native').children[0], 100, 500)+
        ' ms</div>'

    // Now load Mouse onto the page and see what difference it makes
    require(['../src/Mouse'], function (Mouse) {
        [1,2].forEach(function (list) {
            list = document.getElementById(list === 1 ? 'Direct' : 'Delegated')
            list.innerHTML += '<div class="result">Completed 100 - grab, move:50px, drop - cycles in '+
                timeDrag(list.children[0], 100, 50)+
                ' ms</div>'
            list.innerHTML += '<div class="result">Completed 100 - grab, move:500px, drop - cycles in '+
                timeDrag(list.children[0], 100, 500)+
                ' ms</div>'
        })
    })
})