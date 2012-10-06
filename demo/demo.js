require.config({
    baseUrl: '../',
    shim : {
        Adept: {
            exports: '$'
        }
    },
    paths : {
        Adept: '/Libraries/jquery-latest'
    }
})
// This example is working with jquery. Though the library was originally designed to work with adept.js. It would also work with Ender.js, Zepto and others
require(['Adept', 'src/Mouse', '../Dom411/src/Dom411'], function ($) {
    var total, timer, top, left

    // This causes just a single dom event listener
    $('#list1')
        .forward('.item', 'grab.left', start)
        .forward('.item', 'drag.left', move)
        .forward('.item', 'drop.left', stop)
    
    // This causes one listener to be bound to each list item
    $('#list2 > .item')
        .subscribe('grab.left', start)
        .subscribe('drag.left', move)
        .subscribe('drop.left', stop)

    function start (e) {
        timer = e.timeStamp
        total = 0
        top = parseInt(this.style.top, 10) || 0
        left = parseInt(this.style.left, 10) || 0
    }
    function stop (e) {
        var duration = e.timeStamp - timer
        $('#count').html(Math.round(total / (duration / 1000)))
    }
    function move (e) {
        total++
        $(this).css({
            top: (top += e.movementY) + 'px',
            left: (left += e.movementX) + 'px'
        })
    }

    // Using only native events, though, enhanced by jquery
    // Note I wrote two bugs when writing the following code despite having written similar code many times before. Hence the library.
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
        $(this).css({
            top: (top += e.clientY - lastEvent.clientY) + 'px',
            left: (left += e.clientX - lastEvent.clientX) + 'px'
        })
        lastEvent = e
    }
})