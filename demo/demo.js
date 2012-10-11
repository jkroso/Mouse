define([
    '../../Dom411/src/Dom411',
    '../vendor/happen',
    'require'
], function (Dom411, happen, require) {
    'use strict';
    var total, timer, top, left
    window.Dom411 = Dom411

    // This causes just a single dom event listener
    Dom411('#Direct > .item')
        .on('grab.left', start)
        .on('drag.left', move)
        .on('drop.left', stop)
    
    // This causes one listener to be bound to each list item
    Dom411('#Delegated')
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

    function insertResult (el, cycles, distance) {
        var node = document.createElement('div')
        node.innerHTML= cycles*2+
        ' grab, move: '+distance+'px, drop cycles'+
        ' completed in <span class="time">'+timeDrag(el.children[0], cycles, distance)+'ms</span>'
        node.className = 'result'
        el.appendChild(node)
    }

    function test (el) {
        insertResult(el, 50, 10)
        insertResult(el, 50, 500)
    }

    function rerunAll () {
        var native = document.getElementById('Native')
        Dom411('ul').each(function () {
            Array.prototype.slice.call(this.querySelectorAll('.result')).forEach(function (node) {
                node.parentElement.removeChild(node)
            })
        })
        window.mouse.off()
        test(native)
        window.mouse.on()
        Dom411('ul').subtract(native).each(function () {
            test(this)
        })
    }
    // Allow test reruns
    Dom411('#counter button')[0].addEventListener('click', rerunAll, true)

    // Run initial tests
    test(document.getElementById('Native'))
    // Now load Mouse onto the page and see what difference it makes
    require(['../src/Mouse'], function (Mouse) {
        window.mouse = Mouse
        test(document.getElementById('Direct'))
        test(document.getElementById('Delegated'))
    })
})