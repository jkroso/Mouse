require.config({
    baseUrl: '../',
    shim : {
        jQuery: {
            exports: '$'
        }
    },
    paths : {
        jQuery: '/Libraries/jquery-latest'
    }
})
// This example is working with jquery. Though the library was originally designed to work with adept.js. It would also work with Ender.js, Zepto and others
require(['../Dom411/src/Dom411', 'jQuery', 'src/Mouse'], function (Dom411, $) {
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

    // Using only native events, though, enhanced by jquery
    $('#list3 > .item').on('mousedown', function (e) {
        start.call(this, e)
        lastEvent = e
        var dragHandler = jqMove.bind(this)
        $(document.body)
            .on('mousemove', dragHandler)
            .one('mouseup', function (e) {
                stop(e)
                $(document.body).off('mousemove', dragHandler)
            })
    })

    var lastEvent
    function jqMove (e) {
        total++
        this.style.top = (top += e.clientY - lastEvent.clientY) + 'px'
        this.style.left = (left += e.clientX - lastEvent.clientX) + 'px'
        lastEvent = e
    }
})