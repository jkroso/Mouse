var Mouse = require('../src'),
    Dom411 = require('Dom411'),
    happen = require('./happen'),
    Promise = require('laissez-faire'),
    all = require('promises').all

var total, timer, top, left

var now = performance.now && function () {return performance.now()}
    || performance.webkitNow && function () {return performance.webkitNow()}
    || Date.now

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
        if (e.which !== 1) return
        var self = this
        start.call(this, e)
        var lastEvent = e
        document.body.addEventListener('mousemove', dragHandler, true)
        document.body.addEventListener('mouseup', mouseup, true)
        function mouseup (e) {
            if (e.which !== 1) return
            stop(e)
            document.body.removeEventListener('mousemove', dragHandler, true)
            document.body.removeEventListener('mouseup', mouseup, true)
        }
        function dragHandler (e) {
            if (e.which !== 1) return
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
    var start = now()
    while (cycles-- >= 0 ) {
        simulateDrag(el, {x:1,y:1}, distance)
        simulateDrag(el, {x:-1,y:-1}, distance)
    }
    return (now() - start).toFixed(2)
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
    return all([
        function () {
            var p = new Promise
            setTimeout(function () {
                insertResult(el, 500, 10)
                p.resolve()
            }, 50)
            return p
        }(),
        function () {
            var p = new Promise
            setTimeout(function () {
                insertResult(el, 50, 500)
                p.resolve()
            }, 1000)
            return p
        }()
    ])
}

function runAll () {
    Dom411('ul').each(function () {
        Array.prototype.slice.call(this.querySelectorAll('.result')).forEach(function (node) {
            node.parentElement.removeChild(node)
        })
    })
    Mouse.off()
    test(document.getElementById('Native'))
        .then(Mouse.on.bind(Mouse))
        .then(function () {
            return test(document.getElementById('Direct'))
        })
        .then(function () {
            return test(document.getElementById('Delegated'))
        })
}
// Allow test reruns. These could show up browser optimisations
Dom411('#counter button')[0].addEventListener('click', runAll, true)

runAll()